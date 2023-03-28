import { Result } from "../utils/result";

export interface ProductProps {
    temperature: number,
    online: boolean
}

export interface ProductState {
    name: string,
    mode: string,
    target: number
}

export interface ProductDefinition {
    id: string,
    type: string,
    sortOrder: number,
    created: string,
    lastSeen: string,
    parent: string,
    props: ProductProps,
    state: ProductState
}


export class Product implements ProductDefinition {
    private constructor(props: ProductDefinition) {
        this.id = props.id;
        this.type = props.type;
        this.sortOrder = props.sortOrder;
        this.created = props.created;
        this.lastSeen = props.lastSeen;
        this.parent = props.parent;
        this.props = props.props;
        this.state = props.state;
    }

    public readonly id: string;
    public readonly type: string;
    public readonly sortOrder: number;
    public readonly created: string;
    public readonly lastSeen: string;
    public readonly parent: string;
    public readonly props: ProductProps;
    public readonly state: ProductState;

    public static create(props: ProductDefinition): Result<ProductDefinition> {
        if (!props.id) {
            return Result.Failed({
                errorMessage: "Error: id cannot be null or empty.",
                errorType: "InvalidProductId",
            });
        }

        const product = new Product(props);
        return Result.Succeeded(product);
    }
}