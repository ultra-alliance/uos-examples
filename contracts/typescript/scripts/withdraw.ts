import BankService from "../typegen/BankService";
import config from "../ultradev.config";
const { signer: alice } = config.network;

(async () => {
  const bank = new BankService({
    rpcEndpoint: config.network.rpcEndpoint,
    signer: alice,
  });

  const quantity = "10.00000000 UOS";

  console.log("WITHDRAWING: ", quantity);

  await bank.withdraw({
    withdrawer: alice.name,
    quantity,
  });

  const aliceFunds = (
    await bank.getBalancesTable({
      lowerBound: alice.name,
    })
  ).rows[0].funds;

  console.log("ALICE FUNDS: ", aliceFunds);
})();
