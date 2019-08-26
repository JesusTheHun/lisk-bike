require('dotenv').config();

const { Application, genesisBlockDevnet, configDevnet} = require('lisk-sdk'); // require the lisk-sdk package
const { FaucetTransaction } = require('lisk-transaction-faucet');
const { CreateBikeTransaction, RentBikeTransaction, ReturnBikeTransaction } = require('./transactions');

configDevnet.app.label = "LiskBike";
configDevnet.components.storage.host = process.env.DB_HOST;
configDevnet.modules.http_api.access.public = true;

const app = new Application(genesisBlockDevnet, configDevnet);

if (process.env.ENV === 'DEVEL') {
    app.registerTransaction(FaucetTransaction);
}

app.registerTransaction(CreateBikeTransaction);
app.registerTransaction(RentBikeTransaction);
app.registerTransaction(ReturnBikeTransaction);

app
.run()
.then(() => app.logger.info('App started...'))
.catch(error => {
    console.error('Faced error in application', error);
    process.exit(1);
});
