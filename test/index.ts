import beekeeperService from "../src/services/beekeeper.js";

const serverUrl = process.env.SERVER!;

interface HiveProps {
    devicesUrl: string;
    productsUrl: string;
  }

class HiveClient {

    private static readonly hiveProps: HiveProps = {
        devicesUrl: `${serverUrl}/app/ingest`,
        productsUrl: `${serverUrl}/app/csv/ingest`,
      };
    
    public static async start() {
        console.log('Hive Client');

        // const hiveLogin = new hiveSRPclient();
        // const authenticationResult = await hiveLogin.login(process.env.USERNAME!, process.env.PASSWORD!);

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