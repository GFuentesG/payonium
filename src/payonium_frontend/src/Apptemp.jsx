import { useContext, useState } from 'react';
import LoginButton from './components/auth/LoginButton';
import LogoutButton from './components/auth/LogoutButton';
import { AuthContext } from './context/AuthContext';
import { createActor } from 'declarations/payonium_backend';
import './App.css';

function Apptemp() {

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

  const [greeting, setGreeting] = useState('');
  const [principal, setPrincipal] = useState('');
  const [profiles, setProfiles] = useState([]);

  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [dni, setDni] = useState('');
  const [countryorigindocument, setCountryorigindocument] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [countryresidence, setCountryresidence] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const name = event.target.elements.name.value;

    if(!isAuthenticated){
      alert("Por favor, usted debe loguearse primero para ejecutar esta funcion");
      return;
    }

    backend.greet(name).then((greeting) => {
      setGreeting(greeting);
    });
    return false;
  }

  async function handleWhoAmI() {
    const principal = await backend.whoAmI();
    setPrincipal(principal.toString());
  }

  async function getProfiles() {

    try {
      const result = await backend.getProfiles();
      console.log(result);
      if (result.ok.profiles){
        setProfiles(result.ok.profiles);
      } else {
        alert("Error al obtener los perfiles");
      } 
      
    }  catch (err) {
        console.log(err);
    };
  };

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
    };
    try {
      console.log(newProfile);
      const result = await backend.registerUser(newProfile);
      if(result) {
        alert("usuario registrado exitosamente");

      }else {
        alert("error en el registro: " + result.err)
      };
    } catch (err) {
      console.log(err)
    }
    
  }




  return (
    <div >
      <header className="App-header">
        {isAuthenticated ? <LogoutButton /> : <LoginButton />}
        
      </header>
    <main>
      <img src="/logopy.png" alt="PAYONIUM logo" className="logopayonium"/>

      <br />
      <form action="#" onSubmit={handleSubmit}>
        <label htmlFor="name">Enter your name: &nbsp;</label>
        <input id="name" alt="Name" type="text" />
        <button type="submit">Click Me!</button>
      </form>
      <section id="greeting">{greeting}</section>

      <br />
      <div>
      <button onClick={handleWhoAmI}>Who Am I?</button>
      </div>
      <section id="principal">{principal}</section>

      <br />
        <div>
          <button onClick={getProfiles}>Get User Profiles</button>
        </div>
        <section id="profiles">
         
            <ul>
              {profiles.map((profile, index) => (
                <li key={index}>
                  <strong>{profile.name} {profile.lastname}</strong><br />
                  <span>Email: {profile.email}</span><br />
                  <span>DNI: {profile.dni}</span><br />
                  <span>Country of Origin: {profile.countryorigindocument}</span>
                  <span>Phone: {profile.phone}</span><br />
                  <span>Password: {profile.password}</span><br />
                  <span>Country of Residence: {profile.countryresidence}</span><br />
                  <span>Owner: {JSON.stringify(profile.owner)}</span><br />
                  <span>Role: {profile.role}</span><br />
                </li>
              ))}
            </ul>
        
        </section>

        <label>Registro de Usuario</label>
        <br />
        <form onSubmit={registerUser}>
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="text" placeholder="Lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="text" placeholder="DNI" value={dni} onChange={(e) => setDni(e.target.value)} required />
          <input type="text" placeholder="Country origin ID" value={countryorigindocument} onChange={(e) => setCountryorigindocument(e.target.value)}  required />
          <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input type="text" placeholder="Country residence" value={countryresidence} onChange={(e) => setCountryresidence(e.target.value)} required />
          <button type="submit">Registrar Usuario</button>
        </form>
    </main>
    </div>
  );
}

export default Apptemp;
