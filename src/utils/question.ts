import * as readline from 'readline/promises';

export async function getMFACode() : Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let mfaCode = "";
    try{
        mfaCode = await rl.question('Enter MFA code: ');
    }
    finally{
        rl.close();
    }

    return mfaCode;
}
