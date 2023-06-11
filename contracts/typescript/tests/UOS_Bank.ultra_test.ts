import makeTest from "@ultra-alliance/ultradev/dist/esm/functions/makeTest";
import { Services } from "../typegen";

module.exports = makeTest<unknown, Services>(
  {},
  ({ ultratest, getServices, getRequiredAccounts, assert }) => {
    const { common, keychain, endpoint } = ultratest;
    const accounts = getRequiredAccounts();
    const { bob, alice } = accounts;
    const { bank } = getServices();

    const getBalanceByOwner = async (owner: string) => {
      const table = await bank.getBalancesTable({
        lowerBound: owner,
        upperBound: owner,
      });
      return table.rows[0];
    };

    const getNumberOfBalanceCreated = async () => {
      const table = await bank.getBalancesTable({});
      return table.rows.length;
    };

    return {
      "Logging involved accounts access keys:": async () => {
        console.log("\nACCOUNTS:\n");
        console.table(accounts);
      },
      "it should setup code permissions": async () => {
        await bank
          .connect({
            name: bank.name,
            privateKey: keychain.getPrivateKeyFromAccount(bank.name) || "",
          })
          .addUosPerm(bank.name);
        await bank.connect(bob).addUosPerm();
        await bank.connect(alice).addUosPerm();
        await common.sleep(1000);
      },
      "it should deposit funds successfully": async () => {
        await assert(() =>
          common.transfer(alice.name, bank.name, 10.0, "deposit")
        ).toTransfer.to(bank.name, 10, "it should have deposited 10 UOS");
      },
      "it should have added a bank account": async () => {
        const bankCount = await getNumberOfBalanceCreated();
        assert(bankCount).toBe.equal(1, "There should 1 balance in the table");
      },
      "it should withdraw funds successfully": async () => {
        await assert(() =>
          bank.withdraw({
            withdrawer: alice.name,
            quantity: "5.00000000 UOS",
          })
        ).toTransfer.between([bank.name, alice.name], [-5.0, 5.0]);
      },

      "it should fail to withdraw more funds than available": async () => {
        await common.transactAssert(
          bank.withdrawRaw({
            withdrawer: alice.name,
            quantity: "100.00000000 UOS",
          }),
          "Withdraw amount exceeds balance"
        );
      },
      "it should fail to withdraw if no balance created": async () => {
        await common.transactAssert(
          bank.connect(bob).withdrawRaw({
            withdrawer: bob.name,
            quantity: "100.00000000 UOS",
          }),
          "No balance for owner"
        );
      },
      "it should process incoming transfers": async () => {
        await assert(() =>
          common.transfer(alice.name, bank.name, 10.0, "deposit")
        ).toTransfer.between([alice.name, bank.name], [-10.0, 10.0]);
      },
      "it should create a new balance for a new owner": async () => {
        const bankCount = await getNumberOfBalanceCreated();
        await common.transfer(bob.name, bank.name, 5.0, "deposit");
        const balanceCountAfter = (await bank.getBalancesTable({})).rows.length;

        assert(balanceCountAfter).toBe.equal(
          bankCount + 1,
          "There should be one more balance in the table"
        );

        const bobBalance = await getBalanceByOwner(bob.name);
        assert(bobBalance).toBe.notNull(
          "Bob should have a balance in the table"
        );

        assert(bobBalance?.funds).toBe.equal(
          "5.00000000 UOS",
          "Bob should have 5 UOS"
        );
      },
      "it should increment existing balance successfully": async () => {
        const bankCount = await getNumberOfBalanceCreated();
        await common.sleep(1000);
        await common.transfer(bob.name, bank.name, 5.0, "deposit");
        const balancesCountAfter = (await bank.getBalancesTable({})).rows
          .length;

        assert(bankCount).toBe.equal(
          balancesCountAfter,
          "There should be no new balances in the table"
        );

        const bobBankBalanceAfter = await getBalanceByOwner(bob.name);
        assert(bobBankBalanceAfter?.funds).toBe.equal(
          "10.00000000 UOS",
          "Bob should have 10 UOS"
        );
      },
      "it should decrement balance successfully": async () => {
        await bank.withdraw({
          withdrawer: bob.name,
          quantity: "5.00000000 UOS",
        });
        await common.sleep(1000);
        const bobBankBalanceAfter = await getBalanceByOwner(bob.name);
        assert(bobBankBalanceAfter?.funds).toBe.equal(
          "5.00000000 UOS",
          "Bob should have 5 UOS"
        );
      },
      "it should fail to decrement balance below zero": async () => {
        await common.transactAssert(
          bank.withdrawRaw({
            withdrawer: bob.name,
            quantity: "10.00000000 UOS",
          }),
          "Withdraw amount exceeds balance"
        );
      },
    };
  }
);
