//Gustavo Fuentes Gonzales
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Types "./types";
import Map "mo:map/Map";
import { thash } "mo:map/Map";
import { phash } "mo:map/Map";
import Iter "mo:base/Iter";
import Data "canister:data";

actor {

  //Funcion para conocer el Principal del propio usuario
  public shared query (msg) func whoAmI() : async Principal {
    return msg.caller;
  };

  //Funciones para el manejo de perfiles

  stable var profiles = Map.new<Text, Types.Profile>();

  // Función para convertir Text a Role
  func textToRole(roleText : Text) : ?Types.Role {
    switch (roleText) {
      case ("superadmin") { ?#superadmin };
      case ("admin") { ?#admin };
      case ("operator") { ?#operator };
      case ("assistant") { ?#assistant };
      case ("user") { ?#user };
      case (_) { null };
    };
  };

  //Funcion para el registro de usuario
  public shared ({ caller }) func registerUserAdd(newProfile : Types.Profile) : async Types.GetProfileResult {
    if (Principal.isAnonymous(caller)) return #err(#userNotAuthenticated);

    if (newProfile.dni != "") {

      let role = switch (textToRole(newProfile.role)) {
        case (?r) { r };
        case (null) { return #err(#unregisteredUser_invelidRole) };
      };

      var profileWithRole = {
        name = newProfile.name;
        lastname = newProfile.lastname;
        dni = newProfile.dni;
        countryorigindocument = newProfile.countryorigindocument;
        email = newProfile.email;
        phone = newProfile.phone;
        password = newProfile.password;
        countryresidence = newProfile.countryresidence;
        //owner = newProfile.owner;
        owner = caller;
        role = newProfile.role;
        principal = newProfile.principal;
      };

      Map.set(profiles, thash, newProfile.principal, profileWithRole);
      Debug.print("se registro el usuario: " # newProfile.name);
      return #ok(#userSuccessfullyAdded);
    } else {
      Debug.print("no se registro al usuario");
      return #err(#unregisteredUser_nameOrEmailIsInvalid);
    }

  };

  //Funcion para ver todos los registros de usuarios
  public query ({ caller }) func getProfiles() : async Types.GetProfileResult {
    if (Principal.isAnonymous(caller)) return #err(#userNotAuthenticated);

    let profileIter = Map.vals(profiles);
    return #ok(#profiles(Iter.toArray(profileIter)));
  };

  //Función para obtener el perfil del propio usuario
  public shared ({ caller }) func getMyProfile(principal : Text) : async Types.GetProfileResult {
    if (Principal.isAnonymous(caller)) return #err(#userNotAuthenticated);

    Debug.print("el principal text es: " # principal);

    let maybeProfile = Map.get(profiles, thash, principal);

    switch (maybeProfile) {
      case (null) {
        Debug.print("No se encontró el perfil para el principal: " # principal);
        return #err(#userDoesNotExist);
      };
      case (?profile) {

        return #ok(#profile(profile));
      };
    };
  };

  //Funcion para validar si el usuario esta activo
  public shared ({ caller }) func isUserActive(principal : Text) : async Bool {
    let maybeProfile = Map.get(profiles, thash, principal);

    switch (maybeProfile) {
      case (null) {
        Debug.print("Perfil no encontrado para el usuario: " # principal);
        return false;
      };
      case (?profile) {
        return true; // profile.status;
      };
    };
  };

  //Funciones para el manejo de cuentas

  //Funcion para adicionar una cuenta
  public shared ({ caller }) func addAccount(newAccount : Types.Account) : async Types.GetProfileResult {
    if (Principal.isAnonymous(caller)) return #err(#userNotAuthenticated);

    if (newAccount.owner != caller) return #err(#youAreNotTheOwnerOfThisAccount);

    return await Data.addAccount(newAccount);
  };

  //Funcion para obtener la(s) propia(s) cuenta(s)
  public shared (msg) func getMyAccounts(principal : Text) : async Types.GetProfileResult {
    if (Principal.isAnonymous(msg.caller)) return #err(#userNotAuthenticated);

    Debug.print("Principal que llama desde main: " # Principal.toText(msg.caller));

    let maybeProfile = Map.get(profiles, thash, principal);

    switch (maybeProfile) {
      case (null) {
        return #err(#userDoesNotExist);
      };
      case (?profile) {
        let principalValue = Principal.fromText(principal);

        let userAccount = await Data.getAccountsByPrincipal(principalValue);
        return #ok(#accounts(userAccount));
      };
    };

  };

  //Funcion para ver todas las cuentas en general
  public shared (msg) func getAllAccounts() : async Types.GetProfileResult {
    if (Principal.isAnonymous(msg.caller)) return #err(#userNotAuthenticated);

    Debug.print("Principal que llama desde main: " # Principal.toText(msg.caller));

    let accountResult = await Data.getAllAccounts();

    // Aquí orderResult es directamente un array de órdenes
    return #ok(#accounts(accountResult));
  };

  //Funciones para el manejo de ordenes

  //Funcion para registrar una orden
  public shared ({ caller }) func registerOrder(newOrder : Types.Order) : async Types.GetOrderResult {
    if (Principal.isAnonymous(caller)) return #err(#userNotAuthenticated);

    let isActive = await isUserActive(Principal.toText(caller));
    if (isActive == false) {
      Debug.print("El perfil no está activo.");
      return #err(#userDoesNotActiveOrNotExist);
    } else {

      Debug.print("El perfil está activo. Registrando la orden de pago...");
      //await Data.registerPaymentOrder(newOrder);
      //await Data.addOrder(newOrder);
      //return #ok(#orderSuccessfullyAdded);
      return await Data.addOrder(newOrder);
    };

  };

  // public shared (msg) func getAllOrders2() : async Types.GetOrderResult {
  //   if (Principal.isAnonymous(msg.caller)) return #err(#userNotAuthenticated);
  //   Debug.print("Principal que llama desde main: " # Principal.toText(msg.caller));
  //   let orderResult = await Data.getAllOrders();
  //   switch (orderResult) {
  //       case (#ok(result)) {
  //           // Accede a la lista de órdenes desde result.orders
  //           let orderList = result.orders;
  //           return #ok(#orders(orderList));
  //       };
  //       case (#err(e)) {
  //           // Si hubo un error, devuelve el error correspondiente
  //           return #err(e);
  //       };
  //   };
  // };

  //Funcion para obtener todas las ordenes en general
  public shared (msg) func getAllOrders() : async Types.GetOrderResult {
    if (Principal.isAnonymous(msg.caller)) return #err(#userNotAuthenticated);

    Debug.print("Principal que llama desde main: " # Principal.toText(msg.caller));

    let orderResult = await Data.getAllOrders();

    // Aquí orderResult es directamente un array de órdenes
    return #ok(#orders(orderResult));
  };

  //Funcion para obtener la(s) propia(s) orden(es) - OLD (referencial: servira para otros llamados combinados)
  // public shared (msg) func getMyOrder(userDni : Text) : async Types.GetOrderResult {
  //   if (Principal.isAnonymous(msg.caller)) return #err(#userNotAuthenticated);

  //   Debug.print("Principal que llama desde main: " # Principal.toText(msg.caller));

  //   let maybeProfile = Map.get(profiles, thash, userDni);

  //   switch (maybeProfile) {
  //     case (null) {
  //       return #err(#userDoesNotExist);
  //     };
  //     case (?profile) {

  //       let userOrder = await Data.getOrderByPrincipal(profile.owner);
  //       return #ok(#orders(userOrder));
  //     };
  //   };

  // };

  //  Funcion para obtener la(s) orden(es) recibidas
  public shared (msg) func getMyIncomingOrdersByDni() : async Types.GetOrderResult {
    if (Principal.isAnonymous(msg.caller)) return #err(#userNotAuthenticated);

    Debug.print("Principal que llama desde main: " # Principal.toText(msg.caller));

    let maybeProfile = Map.get(profiles, thash, Principal.toText(msg.caller));

    switch (maybeProfile) {
      case (null) {
        return #err(#userDoesNotExist);
      };
      case (?profile) {

        let userOrder = await Data.getOrdersByDni(profile.dni);
        return #ok(#orders(userOrder));
      };
    };

  };

  //Funcion para obtener la(s) propia(s) orden(es)
  public shared (msg) func getMyOrdersByPrincipal() : async Types.GetOrderResult {
    if (Principal.isAnonymous(msg.caller)) return #err(#userNotAuthenticated);

    Debug.print("Principal que llama desde main: " # Principal.toText(msg.caller));

    let userOrders = await Data.getOrderByPrincipal(msg.caller);
    return #ok(#orders(userOrders));
  };

  //Funcion para obtener las ordenes por documento de identitdad
  public shared (msg) func getOrdersByDni(dni : Text) : async Types.GetOrderResult {
    if (Principal.isAnonymous(msg.caller)) return #err(#userNotAuthenticated);

    Debug.print("Principal que llama desde main: " # Principal.toText(msg.caller));

    let userOrders = await Data.getOrdersByDni(dni);
    return #ok(#orders(userOrders));
  };

};
