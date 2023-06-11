import BankService from "../typegen/BankService";
import config from "../ultradev.config";
const { signer: alice } = config.network;

(async () => {
  const bank = new BankService({
    rpcEndpoint: config.network.rpcEndpoint,
    signer: alice,
  });

  const quantity = "100.00000000 UOS";

  console.log("DEPOSITING: ", quantity);

  await bank.transfer({
    from: alice.name,
    to: bank.name,
    quantity,
    memo: "deposit",
  });

  const aliceFunds = (
    await bank.getBalancesTable({
      lowerBound: alice.name,
    })
  ).rows[0].funds;

  console.log("ALICE FUNDS: ", aliceFunds);
})();
