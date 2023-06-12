import { UltraDevConfig } from "@ultra-alliance/ultradev";

const ALICE_PRIVATE_KEY = String(process.env.ALICE_PRIVATE_KEY);
const ALICE_ACCOUNT_NAME = String(process.env.ALICE_ACCOUNT_NAME);

const config: UltraDevConfig = {
  network: {
    rpcEndpoint: "http://127.0.0.1:8888",
    signer: {
      name: ALICE_PRIVATE_KEY,
      privateKey: ALICE_ACCOUNT_NAME,
    },
  },
  testing: {
    requiresSystemContract: true,
    importContracts: [
      {
        account: "bankcontract",
        contract: "bank",
      },
    ],
    requiredAccounts: ["alice", "bob"],
    requiredUnlimitedAccounts: ["zidane"],
  },
  directories: {
    sources: "contracts",
    artifacts: "artifacts",
    tests: "tests",
    scripts: "scripts",
    includes: "includes",
    ricardians: "resources",
  },
  typegen: {
    outdir: "./typegen",
    target: "eosjs",
  },
};

export default config;
