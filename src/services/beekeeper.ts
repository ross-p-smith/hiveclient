import { Product } from '../models/product';
import { ThermostaticRadiatorValve } from '../models/trv.js';
import productRepository, { IRepository } from '../repositories/productRepository.js';
//import { IDevice } from '../models/device';
import { Result } from '../utils/result.js';

const serverUrl = "https://beekeeper-uk.hivehome.com/1.0/";

export interface IBeekeeper {
    getTRVs(): Promise<Result<ThermostaticRadiatorValve[]>>;
    getHeating(): Promise<Result<Product>>;
    getHotWater(): Promise<Result<Product>>;
    getDevice(id: string): Promise<Result<Product>>;
}

export class Beekeeper implements IBeekeeper {
    constructor(
        private readonly productRepository: IRepository<Product>) {}

    // public static async devices(idToken: string) : Promise<IDevice[]> {
    //     const { data, status } = await axios.get<IDevice[]>(`${serverUrl}/devices`, { 
    //         headers: {
    //             Authorization: `${idToken}`,
    //             Origin: `https://my.hivehome.com`,
    //             Referer: `https://my.hivehome.com/`,
    //             Authority: `beekeper-uk.hivehome.com`
    //         }
    //     });

    //     if (status !== 200) {
    //         throw new Error(`🛑 [FAILURE]: Unexpected status code: ${status}`);
    //     }

    //     //console.log(`✅ [PASS] [${status} : ${result.statusText}] - ${data.content}`);

    //     return data
    // }

    public async getTRVs() : Promise<Result<ThermostaticRadiatorValve[]>>
    {
        const products = await productRepository.getByType("trvcontrol");
        if (products.success)
        {
            const trvs = products.content!.map(product => ThermostaticRadiatorValve.create(product).content!);
            if (trvs != null)
            {
                return Result.Succeeded(trvs);
            }
        }

        return Result.Failed({
            errorMessage: "Error: Unable to get TRVs",
            errorType: "InvalidTRVConversion"
        });
    }

    public async getHotWater() : Promise<Result<Product>>
    {
        let result = await productRepository.getByType("hotwater");
        if (result.success && result.content!.length == 1)
        {
            return Result.Succeeded(result.content![0]);
        }
        else
        {
            return Result.Failed({
                errorMessage: "Error: unable to read hot water.",
                errorType: "BeekeeperError"
            });
        }
    }

    public async getHeating() : Promise<Result<Product>>
    {
        let result = await productRepository.getByType("heating");
        if (result.success && result.content!.length == 1)
        {
            return Result.Succeeded(result.content![0]);
        }
        else
        {
            return Result.Failed({
                errorMessage: "Error: unable to read hot water.",
                errorType: "BeekeeperError"
            });
        }
    }

    public async getDevice(id: string) : Promise<Result<Product>>
    {
       return productRepository.getById(id);
    }
}

const beekeeperService: IBeekeeper = new Beekeeper(productRepository);
export default beekeeperService;