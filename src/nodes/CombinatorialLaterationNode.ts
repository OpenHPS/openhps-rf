import { 
    BufferOptions,
    DataFrame,
    GraphBuilder, 
    GraphShapeNode, 
    MergeShape, 
    ObjectProcessingNodeOptions,
    TimeUnit,
    Constructor,
    WorkerNode,
    WorkerNodeOptions,
    CallbackNode,
    RelativeDistance,
    RelativePositionProcessing,
    DataObject,
} from "@openhps/core";
import { 
    RelativeRSSI 
} from "../data";
import { 
    PropagationModel,
    RelativeRSSIOptions, 
    RelativeRSSIProcessing 
} from "./RelativeRSSIProcessing";
import * as LM from 'ml-levenberg-marquardt';

/**
 * This combinatorial lateration node is an implementation of the paper 'A Lateration Method based on 
 * Effective Combinatorial Beacon Selection for Bluetooth Low Energy Indoor Positioning'. This processing
 * node can be directly linked to a source node that captures BLE advertisements.
 * 
 * This node is an implementation of the techniques described in the paper that creates an abstraction
 * of multiple underlying nodes.
 * 
 * @date 2021-10
 * @abstract Nowadays, the Bluetooth Low Energy (BLE) technology joined with the Received Signal Strength Indicator technique has became a popular approach in Indoor Positioning
 *   System, thanks to the wide availability of BLE in anchors and
 *   wearable devices and the straightforward implementation of
 *   both. Consequently, methods based on geometric properties of
 *   anchors, as lateration, are capable of enhancing the positioning
 *   accuracy exploiting the growing availability of anchors and
 *   their rich geometric distribution in indoor environments. On
 *   the downside, an inappropriate selection of anchors decreases
 *   the positioning accuracy estimation. Therefore, integrating an
 *   effective beacon selection method can enhance the reliability and
 *   accuracy of these methods. In this paper, we present a novel and
 *   straightforward Lateration indoor positioning method based on
 *   effective combinatorial BLE beacon selection. The combinatorial
 *   BLE selection approach relies on a geometrical analysis (difference of triangle areas), of each beacon combination, considering
 *   the reference beacons’ position with the estimated position using
 *   lateration, and with a globally calculated virtual target position
 *   as reference. The real-world experiment demonstrated that the
 *   proposed method improves the traditional lateration with 5% to
 *   16%, considering different evaluation metrics
 * @conference 17th International Conference on Wireless and Mobile Computing, Networking and Communications (WiMob)
 * @author Pavel Pascacio
 * @author Joaquín Torres-Sospedra
 * @author Sven Castelyn
 * @see {@link http://dx.doi.org/10.1109/WiMob52687.2021.9606419}
 */
export class CombinatorialLaterationNode<InOut extends DataFrame> extends GraphShapeNode<InOut, InOut> {
    protected options: CombinatorialLaterationOptions;

    constructor(options?: CombinatorialLaterationOptions) {
        super(options);
        /** RSSI PROPAGATION SETTINGS */
        // Paper describes LDPL as default propagation model
        this.options.propagationModel = this.options.propagationModel || PropagationModel.LOG_DISTANCE;
        // Paper uses 2.1 as environment factor
        this.options.defaultEnvironmentFactor = this.options.defaultEnvironmentFactor || 2.1;
        // Paper uses -63.7816 dBm as default RSS at 1 meter distance. This value will be overridden
        // by the data stored in each deployed beacon
        this.options.defaultCalibratedRSSI = this.options.defaultCalibratedRSSI || -63.7816;

        // Paper uses -83 dBm as a threshold for average RSSI
        this.options.threshold = this.options.threshold || -83;
        // Paper collects the RSS from BLE advertisements for a period of 60 seconds
        this.options.timeout = this.options.timeout || 60;
    }

    construct(builder: GraphBuilder<InOut, InOut>): GraphBuilder<InOut, InOut> {
        // We assume the 1st step is done by earlier nodes in the processing
        return builder.from()
            // 2nd step, 3rd step and 4th step
            .via(new RSSGroupingNode(this.options))
            // 5th step: Estimate the relative distances of selected 
            // reference BLE beacons to the target position
            .via(new RelativeRSSIProcessing(this.options))
            // 6th step: For the set of the 9 selected reference beacons
            // selected in the previous steps, create 126 combinations
            .via(new CallbackNode(function(frame: DataFrame) {
                const refBeacons: RelativeDistance[] = frame.source.getRelativePositions()
                    .filter(rp => rp instanceof RelativeDistance) as RelativeDistance[];
                // Create combinations
                const emptySource = frame.source.clone();
                emptySource.relativePositions = [];
                const numCombinations = refBeacons.length! / (5! * (refBeacons.length - 5)!);
                for (let i = 0 ; i < numCombinations; i++) {
                    const newFrame = new DataFrame(emptySource.clone());
                    newFrame.uid = frame.uid; // Use same identifier for merging
                    newFrame.createdTimestamp = frame.createdTimestamp;
                    for (let j = 0 ; j < refBeacons.length ; j++) {
                        if ((i & Math.pow(5, j))){ 
                            newFrame.source.addRelativePosition(refBeacons[j]);
                        }
                    }
                    // Push the new frame
                    this.push(newFrame);
                }
            }, () => undefined, { autoPush: false }))
            // 7th step: Estimate the target position for each combination created, 
            // using the Levenberg-Marquardt Least Squares (L-MLS) Lateration method to 
            // fit the Euclidean Distance model
            .via(new WorkerNode(new LMLSProcessingNode(), this.options))
            .to();
    }

}

/**
 * Configuration and tweaking configuration of the combinatorial lateration. 
 */
export interface CombinatorialLaterationOptions extends ObjectProcessingNodeOptions, 
    RelativeRSSIOptions, BufferOptions, WorkerNodeOptions, Partial<LM.Options> {
    /**
     * Threshold RSSI for beacons (in dBm). Beacons who have an RSSI lower than this threshold will not be
     * considered for lateration.
     *
     * @default -83
     */
    threshold?: number;
    /**
     * Amount of time (in seconds) to collect RSSI readings.
     *
     * @default 60 seconds
     */
    timeout?: number;
}

class LMLSProcessingNode<InOut extends DataFrame> extends RelativePositionProcessing<InOut, RelativeDistance> {
    constructor() {
        super(RelativeDistance);
    }

    processRelativePositions(
        dataObject: DataObject,
        relativePositions: Map<RelativeDistance, DataObject>,
        dataFrame?: InOut,
    ): Promise<DataObject> {
        return new Promise((resolve, reject) => {
            const positionEstimate = LM(Array.from(relativePositions.values()).map(ref => {
                const pos = ref.position.toVector3();
                return {
                    x: [pos.x],
                    y: [pos.y]
                }
            }).reduce((a, b) => ({ x: [...a.x, ...b.x], y: [...a.y, ...b.y]})), undefined);
            
            // Heron's formula
            const areaTarget = Math.sqrt(4) / 4.;
            const areaEstimated = Math.sqrt(4) / 4.;
            resolve(dataObject);
        });
    }

}

class RSSGroupingNode<InOut extends DataFrame> extends MergeShape<InOut> {
    protected options: CombinatorialLaterationOptions;

    constructor(options: CombinatorialLaterationOptions) {
        super(frame => {
            return frame.uid; // Unique identifier
        }, frame => {
            // First group by the user/sensor that obtains the data
            // this 'process network' might be used by multiple users
            return frame.source.uid;
        }, {
            // Based on a timeout - group RSS readings for X seconds
            timeout: options.timeout,
            timeoutUnit: TimeUnit.SECOND,
        });
        this.options = options;
    }

    /**
     * This function will merge the collected sensor observations of one source/sensor
     * every timeout.
     *
     * @param {DataFrame[]} frames Frames to merge
     * @returns {DataFrame} Output data frame with merged data
     */
    merge(frames: InOut[]): InOut {
        // 2nd step: Group the RSS readings by beacon
        const relativePositions = frames.map(f => f.source.getRelativePositions()).flat();
        const rssiPerBeacon: Map<string, number[]> = new Map();
        relativePositions.forEach(rp => {
            const data = rssiPerBeacon.get(rp.referenceObjectUID) ?? [];
            data.push(rp.referenceValue);
        });

        // 2nd step: ... removing outlier values
        rssiPerBeacon.forEach((values: number[]) => {
            values = values.sort((a, b) => a - b);
            const half = Math.floor(values.length / 2);
            const median = values.length % 2 ? values[half] : (values[half - 1] + values[half]) / 2.0;
            const absDev = values.map(v => Math.abs(v - median));
            const mad = values.length % 2 ? absDev[half] : (absDev[half - 1] + absDev[half]) / 2.0;
            values = values.filter(v => (v - median / mad) < 3);
        });

        // 3rd step: Apply the average to the RSS values of each
        // reference beacon, getting one averaged RSSI value per
        // reference beacon.
        const result = new (frames[0].constructor as Constructor<InOut>)();
        result.source = frames[0].source;
        result.source.relativePositions = [];
        Array.from(rssiPerBeacon.entries())
            .map(([key, values]) => ([key, values.reduce((a, b) => a + b) / values.length]))
            // 4rd step: Select the reference BLE beacons with averaged RSS equal or greater than the threshold dBm
            .filter(([_, value]) => value >= this.options.threshold)
            // ... and in case of more than 9 beacons, only consider the 9 strongest ones.
            .sort((a, b) => (a[1] as number) - (b[1] as number))
            .slice(0, 9)
            .forEach(([key, value]) => {
                result.source.addRelativePosition(new RelativeRSSI(key as string, value as number));
            });
        return result;
    }
}
