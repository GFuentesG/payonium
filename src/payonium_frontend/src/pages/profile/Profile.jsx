//Gustavo Fuentes Gonzales
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { createActor } from 'declarations/payonium_backend';
import styles from './Profile.module.css';

function Profile() {

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


  const [principal, setPrincipal] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [userAccount, setUserAccount] = useState(null);

  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [dni, setDni] = useState('');
  const [countryorigindocument, setCountryorigindocument] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [countryresidence, setCountryresidence] = useState('');

  const [error, setError] = useState(null);
  const [userStatus, setUserStatus] = useState('');

  async function handleWhoAmI() {
    const principal = await backend.whoAmI();
    console.log("prueba");
    setPrincipal(principal.toString());
  }

  async function handleGetUserProfile() {
    if (!isAuthenticated) {
      alert("Debe estar logueado para obtener el perfil.");
      return;
    }

    const userPrincipalText = identity.getPrincipal().toText();

    try {
      console.log("respuesta a analizar")
      const result = await backend.getMyProfile(userPrincipalText);
      console.log(result);

      if (result.ok && result.ok.profile) {
        console.log('Perfil recibido:', result.ok.profile);
        setUserProfile(result.ok.profile);
        setError(null);
      } else {
        alert("No se encontró el perfil del usuario.");
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function registerUser(event) {
    event.preventDefault();
    if (!isAuthenticated) {
      alert("Debe estar logueado para registrar un usuario.");
      return;
    }

    const newProfile = {
      name, lastname, email, dni, countryorigindocument, phone, password, countryresidence,
      owner: identity.getPrincipal(),
      role: 'user',
      principal: identity.getPrincipal().toText(),
    };
    try {
      console.log(newProfile);
      const result = await backend.registerUserAdd(newProfile);
      if (result) {
        alert("usuario registrado exitosamente");

      } else {
        alert("error en el registro: " + result.err)
      };
    } catch (err) {
      console.log(err)
    }

  }

  //Manejando cuentas

  async function getMyAccount() {
    if (!isAuthenticated) {
      alert("Debe estar logueado para obtener el perfil.");
      return;
    }

    const userPrincipalText = identity.getPrincipal().toText(); // Obtener el Principal en formato texto

    try {
      // Llamar al backend para obtener el perfil asociado a ese Principal (usando el texto del Principal)
      console.log("respuesta a analizar")
      const result = await backend.getMyAccounts(userPrincipalText); // Llamar a la nueva función en el backend
      console.log(result);

      if (result.ok && result.ok.accounts && result.ok.accounts.length > 0) {
        console.log('Cuenta recibida:', result.ok.account);
        setUserAccount(result.ok.accounts);  // Guardamos el perfil del usuario logueado
        setError(null);  // Limpiar errores si la solicitud es exitosa
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


  // Función para verificar si el usuario está activo
  async function isUserActive() {
    if (!isAuthenticated) {
      alert("Debe estar logueado para verificar el estado del usuario.");
      return;
    }

    const userPrincipalText = identity.getPrincipal().toText();

    try {
      const result = await backend.isUserActive(userPrincipalText);
      if (result) {
        //alert(result ? "El usuario está activo." : "El usuario no está activo.");
        setUserStatus("El usuario esta activo");
      } else {
        //alert("No se pudo verificar el estado del usuario.");
        setUserStatus("El usuario no esta activo")
      }
    } catch (err) {
      console.log(err);
      //alert("Error al verificar el estado del usuario.");
      setUserStatus("Error al verificar el estado del usuario");
    }
  }

  return (
    <div className={styles.container}>


      <div className={styles.profileSection}>
        <button onClick={handleWhoAmI}>Who Am I?</button>
        <section id="principal">{principal}</section>
      </div>



      <div className={styles.formWrapper}>

        <label>User registration</label>
        <br />
        <form onSubmit={registerUser}>
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="text" placeholder="Lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="text" placeholder="DNI" value={dni} onChange={(e) => setDni(e.target.value)} required />
          <input type="text" placeholder="Country origin ID" value={countryorigindocument} onChange={(e) => setCountryorigindocument(e.target.value)} required />
          <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input type="text" placeholder="Country residence" value={countryresidence} onChange={(e) => setCountryresidence(e.target.value)} required />

          <div className={styles.formFooter} >
            <button type="submit">Confirm</button>
          </div>

        </form>


        <div>

          <div className={styles.profileSection}>
            <button onClick={handleGetUserProfile}>Get my profile</button>
          </div>

          {error && <div className={styles.error}>{error}</div>}  {/* Mostrar error si ocurre */}

          {userProfile ? (
            <div className={styles.profileDisplay}>
              <h3>Perfil del Usuario</h3>
              <p><strong>Nombre:</strong> {userProfile.name}</p>
              <p><strong>Apellido:</strong> {userProfile.lastname}</p>
              <p><strong>Email:</strong> {userProfile.email}</p>
              <p><strong>DNI:</strong> {userProfile.dni}</p>
              <p><strong>País de origen:</strong> {userProfile.countryorigindocument}</p>
              <p><strong>Teléfono:</strong> {userProfile.phone}</p>
              <p><strong>País de residencia:</strong> {userProfile.countryresidence}</p>
              <p><strong>Rol:</strong> {userProfile.role}</p>
            </div>
          ) : (
            <div className={styles.noProfile}>The profile has not been loaded yet</div>
          )}

        </div>

        <div className={styles.isUserActiveWrapper}>
          <button onClick={isUserActive}>Check if User is Active</button>
          {userStatus && <div id="principal" className={styles.userStatus}>{userStatus}</div>}
        </div>

        <div>
          <button onClick={getMyAccount}>Get my accounts</button>

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

export default Profile;
