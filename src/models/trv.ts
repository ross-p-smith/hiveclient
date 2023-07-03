import { Result } from "../utils/result.js";
import { ProductDefinition } from "./product";

export interface thermostaticRadiatorValveProps {
    id: string,
    name: string,
    mode: string,
    target: number,
    currentTemperature: number
    online: boolean
}

export class ThermostaticRadiatorValve implements thermostaticRadiatorValveProps {
    private constructor(id: string, name: string, mode: string, target: number, currentTemperature: number,
        online: boolean) {
        this.id = id;
        this.name = name;
        this.mode = mode;
        this.target = target;
        this.currentTemperature = currentTemperature;
        this.online = online;
    }

    public readonly id: string;
    public readonly name: string;
    public readonly mode: string;
    public readonly target: number;
    public readonly currentTemperature: number;
    public readonly online: boolean;

    public static create(props: ProductDefinition): Result<ThermostaticRadiatorValve> {
        if (!props.id) {
            return Result.Failed({
                errorMessage: "Error: id cannot be null or empty.",
                errorType: "InvalidProductId",
            });
        }

        const trv = new ThermostaticRadiatorValve(
            props.id,
            props.state.name,
            props.state.mode,
            props.state.target,
            props.props.temperature,
            props.props.online

        );
        return Result.Succeeded(trv);
    }

    public static boost(): Result<ThermostaticRadiatorValve> {
        return Result.Failed({
            errorMessage: "Error: boost not implemented.",
            errorType: "NotImplemented",
        });
    }
}