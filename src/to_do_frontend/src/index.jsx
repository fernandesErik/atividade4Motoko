import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createActor, to_do_backend } from 'declarations/to_do_backend';
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";

let actorLoginBackend = to_do_backend;

function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [principal, setPrincipal] = useState("");
  const navigate = useNavigate();

  async function login() {
    const authClient = await AuthClient.create();

    await authClient.login({
      identityProvider: "https://identity.ic0.app/#authorize",
      onSuccess: async () => {
        const identity = authClient.getIdentity();
        const agent = new HttpAgent({ identity });

        actorLoginBackend = createActor(process.env.CANISTER_ID_TO_DO_BACKEND, {
          agent,
        });

        const principalText = await actorLoginBackend.get_principal_client();
        setPrincipal(principalText);
        setIsLoggedIn(true);
        console.log(principalText);

        navigate("/tarefas");
      },
      windowOpenerFeatures: `
        left=${window.screen.width / 2 - 525 / 2},
        top=${window.screen.height / 2 - 705 / 2},
        toolbar=0,location=0,menubar=0,width=525,height=705
      `,
    });
  }

  async function logout() {
    const authClient = await AuthClient.create();
    await authClient.logout();
    setIsLoggedIn(false);
    setPrincipal("");
  }

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
          TO-DO
        </h1>
        <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 lg:px-48 dark:text-gray-400">
          Controle suas tarefas 100% onchain na ICP!
        </p>

        <div className="flex flex-col sm:flex-row sm:justify-center gap-4">
          {!isLoggedIn && (
            <button
              id="login"
              onClick={login}
              className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition duration-300 ease-in-out"
            >
              Login com Internet Identity
            </button>
          )}
          {isLoggedIn && (
            <button
              id="logout"
              onClick={logout}
              className="px-6 py-3 text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition duration-300 ease-in-out"
            >
              Logout
            </button>
          )}
        </div>

        {principal && (
          <p className="mt-6 text-sm text-gray-600 dark:text-gray-300">
            Seu Principal: <span className="font-mono">{principal}</span>
          </p>
        )}
      </div>
    </section>
  );
}

export default Index;