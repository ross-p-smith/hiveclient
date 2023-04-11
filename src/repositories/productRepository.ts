import axios from 'axios';
import authClient, { AuthenticationResult, IAuthenticationService } from '../hiveSRPclient.js';
import { Product } from '../models/product';
import { Result } from '../utils/result.js';

const serverUrl = "https://beekeeper-uk.hivehome.com/1.0/";

export interface IRepository<T> {
    getById(id: string): Promise<Result<T>>;

    getAll(): Promise<Result<T[]>>;

    getByType(type: string): Promise<Result<T[]>>;
}

export class ProductRepository implements IRepository<Product> {

    constructor(private readonly authenticationService: IAuthenticationService) {
    }

    async getById(id: string): Promise<Result<Product>> {
        const result = await this.getAll();
        if (result.failure)
        {
            return Result.Failed({
                errorMessage: result.error!.errorMessage,
                errorType: result.error!.errorType
            })
        }

        const device = result.content!.find((p) => p.id === id);
        if (device === null)
        {
            return Result.Failed({
                errorMessage: "Error: device not found `${id}`",
                errorType: "ProductRepositoryNotFound"
            })
        }
        else
        {
            return Result.Succeeded(device!);
        }
    }

    async getAll(): Promise<Result<Product[]>> {
        try {
            const authenticationResult = await this.authenticationService.login(process.env.HIVE_USERNAME!, process.env.HIVE_PASSWORD!);

            const { data, status } = await axios.get<Product[]>(`${serverUrl}/products`, { 
                headers: {
                    Authorization: `${authenticationResult.IdToken}`,
                    Origin: `https://my.hivehome.com`,
    
                    Referer: `https://my.hivehome.com/`,
                    Authority: `beekeper-uk.hivehome.com`
                }
            });

            if (status !== 200) {
                return Result.Failed({
                    errorMessage: "Error: unable to read products.",
                    errorType: "BeekeeperError"
                });
            }
    
            return Result.Succeeded(data);
        }
        catch (ex) {
            return Result.Failed({
                errorMessage: "Error: unable to read product.",
                errorType: "ProductRepositoryError",
                details: ex
            });
        }
    }

    async getByType(type: string): Promise<Result<Product[]>> {
        const result = await this.getAll();
        if (result.failure)
        {
            return result;
        }
        else
        {
            if (result.content!.length > 0)
            {
                return Result.Succeeded(result.content!.filter((p) => p.type === type));
            }
            else
            {
                return Result.Failed({
                    errorMessage: "Error: No products of type $type.",
                    errorType: "ProductRepositoryItemsNotFound"
                });
            }
        }
    }
}

const productRepository: IRepository<Product> = new ProductRepository(authClient);
export default productRepository;