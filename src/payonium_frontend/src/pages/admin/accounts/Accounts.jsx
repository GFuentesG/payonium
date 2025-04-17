import { useContext, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { createActor } from 'declarations/payonium_backend';
import styles from '../../profile/Profile.module.css';

function Accounts() {


  const { isAuthenticated, identity } = useContext(AuthContext);

  let canisterId = process.env.CANISTER_ID_PAYONIUM_BACKEND;

  const host = process.env.DFX_NETWORK === "ic"
    ? "https://icp0.io"
    : "http://localhost:4943";

  let backend = createActor(canisterId, {
    agentOptions: {
      identity: identity,
      host: host,
    },
  });



  const [userAccount, setUserAccount] = useState(null);
  const [error, setError] = useState(null);

  //Manejando cuentas - Cambiar por ver todas las cuentas y ver las cuentas de un usuario

  async function getMyAccount() {    
    if (!isAuthenticated) {
      alert("Debe estar logueado para obtener el perfil.");
      return;
    }

    const userPrincipalText = identity.getPrincipal().toText(); 

    try {
 
      console.log("respuesta a analizar")
      const result = await backend.getMyAccounts(userPrincipalText); 
      console.log(result);

      if (result.ok && result.ok.accounts && result.ok.accounts.length > 0) {
        console.log('Cuenta recibida:', result.ok.account);
        setUserAccount(result.ok.accounts); 
        setError(null); 
      } else {
        alert("No se encontró la cuenta del usuario.");

        // if (!userAccount || !userAccount.name) {
        //   return <div>No se pudo cargar la cuenta correctamente.</div>;
        // }
      }
    } catch (err) {
      console.log(err);
    }
  }


  return (
    <div className={styles.container}>

     
      <div className={styles.formWrapper}>

        <div>
          <button onClick={getMyAccount}>Get all accounts</button>

          {error && <div className={styles.error}>{error}</div>}

          {userAccount ? (
            <div className={styles.profileDisplay}>
              <h3>Cuentas del Usuario</h3>
              {userAccount.map((account, index) => (
                <div key={index}>
                  <p><strong>Cuenta {index + 1}</strong></p>
                  <p><strong>Cuenta larga:</strong> {account.longaccountnumber}</p>
                  <p><strong>Nombre de la cuenta:</strong> {account.namebankaccount}</p>
                  <p><strong>Número de cuenta simple:</strong> {account.simpleaccountnumber}</p>
                  <p><strong>Moneda de depósito:</strong> {account.depositcurrency}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noProfile}>The account has not been loaded yet</div>
          )}
        </div>
      </div>
    </div>
  );
}




export default Accounts