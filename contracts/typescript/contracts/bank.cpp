#include "../includes/bank.hpp"

ACTION bank::withdraw(name withdrawer, asset quantity)
{
    require_auth(withdrawer);

    auto owner_balance = balances.find(withdrawer.value);
    check(owner_balance != balances.end(), "No balance for owner");
    check(owner_balance->funds >= quantity, "Withdraw amount exceeds balance");

    withdraw_funds(withdrawer, quantity);

    action(permission_level{_self, "active"_n},
           "eosio.token"_n, "transfer"_n,
           std::make_tuple(get_self(), withdrawer, quantity, std::string("Bank Withdraw")))
        .send();
}

void bank::on_transfer(name from, name to, asset quantity, string memo)
{
    if (to != get_self())
        return;

    check(memo != "", "Memo cannot be empty");

    validate_asset(quantity);
    deposit_funds(from, quantity);
}

void bank::deposit_funds(name owner, asset value)
{
    auto owner_balance = balances.find(owner.value);

    if (owner_balance == balances.end())
    {
        create_balance(owner, value);
    }
    else
    {
        incr_balance(owner_balance, value);
    }
}

void bank::withdraw_funds(name owner, asset value)
{
    auto owner_balance = balances.find(owner.value);
    decr_balance(owner_balance, value);
}

void bank::validate_asset(asset value)
{
    check(value.symbol == bank_symbol, "Only UOS tokens are accepted");
    check(value.amount > 0, "Amount must be greater than zero");
}

void bank::create_balance(name owner, asset value)
{
    balances.emplace(get_self(), [&](auto &row)
                     { 
        row.owner = owner;
        row.funds = value; });
}

void bank::incr_balance(t_balance_table::const_iterator balance, asset value)
{
    balances.modify(balance, get_self(), [&](auto &row)
                    { row.funds += value; });
}

void bank::decr_balance(t_balance_table::const_iterator balance, asset value)
{
    check(balance->funds.amount >= value.amount, "Insufficient funds");
    balances.modify(balance, get_self(), [&](auto &row)
                    { row.funds -= value; });
}