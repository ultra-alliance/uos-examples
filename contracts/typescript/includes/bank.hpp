#pragma once
#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include <eosio/symbol.hpp>

using namespace eosio;
using namespace std;

CONTRACT bank : public eosio::contract
{
public:
    using contract::contract;

    bank(name receiver, name code, datastream<const char *> ds)
        : contract(receiver, code, ds), balances(receiver, receiver.value) {}

    ACTION withdraw(name withdrawer, asset quantity);
    [[eosio::on_notify("eosio.token::transfer")]] void on_transfer(name from, name to, asset quantity, string memo);

private:
    static constexpr symbol bank_symbol = symbol("UOS", 8);

    TABLE t_balance
    {
        name owner;
        asset funds;
        uint64_t primary_key() const { return owner.value; }
    };

    typedef eosio::multi_index<"balances"_n, t_balance> t_balance_table;
    t_balance_table balances;

    void deposit_funds(name owner, asset value);
    void withdraw_funds(name owner, asset value);
    void validate_asset(asset value);
    void create_balance(name owner, asset value);
    void incr_balance(t_balance_table::const_iterator balance, asset value);
    void decr_balance(t_balance_table::const_iterator balance, asset value);
};