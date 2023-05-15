import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Login/Login';
import SignUp from './SignUp/SignUp';
import Verify from './Verify/Verify';
import Main from './Main/Main';
import Rank from './Rank/Rank';
import Profile from './Profile/Profile';
import OAuth from './Etc/OAuth';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SocketContext, socket } from "./Socket/SocketContext";
import NotFound from './Etc/NotFound';
import Game from './Game/Game';
import { CustomRoute } from './Util/CustomRoute';

const queryClient: QueryClient = new QueryClient();

function App() {
  return (
  	<div className="App">
      <SocketContext.Provider value={socket}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Login/>}/>
              <Route path='/auth/callback' element={<OAuth/>}/>
              <Route path='/signup' element={<CustomRoute.AuthRoute isSignUp={true} isVerify={false} component={<SignUp/>}/>}/>
              <Route path='/verify' element={<CustomRoute.AuthRoute isSignUp={false} isVerify={true} component={<Verify/>}/>}/>
              <Route path='/main' element={<CustomRoute.PrivateRoute component={<Main/>}/>}/>
              <Route path='/rank' element={<CustomRoute.PrivateRoute component={<Rank/>}/>}/>
              <Route path='/profile/*' element={<CustomRoute.PrivateRoute component={<Profile/>}/>}/>
              <Route path='/game/*' element={<CustomRoute.PrivateRoute component={<Game/>}/>}/>
              <Route path='/*' element={<NotFound/>}/>
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </SocketContext.Provider>
	  </div>
  )
}

export default App;