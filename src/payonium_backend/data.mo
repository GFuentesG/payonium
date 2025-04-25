//Gustavo Fuentes Gonzales
import Principal "mo:base/Principal";
import Types "./types";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Array "mo:base/Array";

actor Data {

    stable var accounts : [Types.Account] = [];
    stable var orders : [Types.Order] = [];

    private func internalAddAccount(newAccount : Types.Account) : async Types.GetProfileResult {
        accounts := Array.append(accounts, [newAccount]);
        Debug.print("Cuenta bancaria registrada para el Principal: " # Principal.toText(newAccount.owner));
        return #ok(#accountSuccessfullyAdded);
    };

    public shared func addAccount(newAccount : Types.Account) : async Types.GetProfileResult {
        //if (Principal.isAnonymous(caller)) return #err(#userNotAuthenticated);

        // Verifica que el propietario de la cuenta sea el que está llamando
        // if (newAccount.owner != caller) { return #err(#youAreNotTheOwnerOfThisAccount); };

        return await internalAddAccount(newAccount);
    };

    public query func getAllAccounts() : async [Types.Account] {
        return accounts;
    };

    public query func getAccountsByPrincipal(owner : Principal) : async [Types.Account] {
        //query  shared ({caller})
        //if (Principal.isAnonymous(caller)) return #err(#userNotAuthenticated);

        //Debug.print("Principal que llama desde data: " # Principal.toText(owner));

        let userAccounts = Array.filter<Types.Account>(accounts, func(account) { account.owner == owner });

        return userAccounts;

    };

    public shared func delAccount(simpleaccountnumber : Text) : async Types.GetProfileResult {
        // if (Principal.isAnonymous(caller)) return #err(#userNotAuthenticated);

        var accountFound = false;
        var updatedAccounts : [Types.Account] = [];

        for (i in Iter.range(0, Array.size(accounts) - 1)) {
            let account = accounts[i];
            if (account.simpleaccountnumber == simpleaccountnumber) {
                // if (account.owner != caller) {
                //     return #err(#youAreNotTheOwnerOfThisAccount);
                // };
                accountFound := true;
            } else {
                updatedAccounts := Array.append(updatedAccounts, [account]);
            };
        };

        if (accountFound) {
            accounts := updatedAccounts;
            return #ok(#accountSuccessfullyDeleted);
        } else {
            return #err(#noAccountFound);
        };
    };

    public query func getAccountByNumber(simpleaccountnumber : Text) : async Types.GetProfileResult {
        //if (Principal.isAnonymous(caller)) return #err(#userNotAuthenticated);

        let maybeAccount = Array.find<Types.Account>(accounts, func(account) { account.simpleaccountnumber == simpleaccountnumber });

        switch (maybeAccount) {
            case null {
                return #err(#noAccountFound);
            };
            case (?account) {
                // if (account.owner != caller) {
                //     return #err(#youAreNotTheOwnerOfThisAccount);
                // };
                return #ok(#accounts([account]));
            };
        };
    };



    public shared ({ caller }) func updateAccount(simpleaccountnumber : Text, updatedAccount : Types.Account) : async Types.GetProfileResult {
        //if (Principal.isAnonymous(caller)) return #err(#userNotAuthenticated);

        var accountFound = false;
        var updatedAccounts : [Types.Account] = [];

        for (i in Iter.range(0, Array.size(accounts) - 1)) {
            let account = accounts[i];
            if (account.simpleaccountnumber == simpleaccountnumber) {
                // if (account.owner != caller) {
                //     return #err(#youAreNotTheOwnerOfThisAccount);
                // };

                let updatedAccountWithOldSimpleAccountNumber = {
                    namebankaccount = updatedAccount.namebankaccount;
                    simpleaccountnumber = account.simpleaccountnumber;
                    longaccountnumber = updatedAccount.longaccountnumber;
                    depositcurrency = updatedAccount.depositcurrency;
                    owner = caller;
                };
                updatedAccounts := Array.append(updatedAccounts, [updatedAccountWithOldSimpleAccountNumber]);
                accountFound := true;
            } else {
                updatedAccounts := Array.append(updatedAccounts, [account]);
            };
        };

        if (accountFound) {
            accounts := updatedAccounts;
            return #ok(#accountSuccessfullyUpdated);
        } else {
            return #err(#noAccountFound);
        };
    };

    //Registro de Operaciones

    //stable var orders: [Types.Order] = [];

    private func internalAddOrder(newOrder : Types.Order) : async Types.GetOrderResult {
        orders := Array.append(orders, [newOrder]);
        return #ok(#orderSuccessfullyAdded);
    };

    public shared func addOrder(newOrder : Types.Order) : async Types.GetOrderResult {
        //if (Principal.isAnonymous(caller)) return #err(#userNotAuthenticated);
        return await internalAddOrder(newOrder);

    };


    public query func getAllOrders(): async [Types.Order] {
        return orders;
    };

    public query func getOrderByPrincipal(owner : Principal) : async [Types.Order] {
        //if (Principal.isAnonymous(caller)) return #err(#userNotAuthenticated);
        //Debug.print("Principal que llama desde data: " # Principal.toText(owner));
        let userOrders = Array.filter<Types.Order>(orders, func(order) { order.owner == owner });
        return userOrders;

    };


    public query func getOrdersByDni(dni: Text) : async [Types.Order] {
        let userOrders = Array.filter<Types.Order>(orders, func(order) { order.dni == dni });
        return userOrders;
    };





};
