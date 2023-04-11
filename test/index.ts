//import beekeeperService from "../src/services/beekeeper.js";

import beekeeperService from "../dist/src/services/beekeeper.js";

class HiveClient {
    
    public static async start() {
        console.log('Hive Client');

        const trvs = await beekeeperService.getTRVs();
        console.table(trvs.content);

        const heating = await beekeeperService.getHeating();
        console.log(heating.content);

        const hotWater = await beekeeperService.getHotWater();
        console.log(hotWater.content);

        const device = await beekeeperService.getDevice("eee8e3ee-d269-4764-9ab9-27932064206e");
        console.log(device.content);
    }
}

HiveClient.start();