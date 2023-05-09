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
              <Route path='/signup' element={<SignUp/>}/>
              <Route path='/verify' element={<Verify/>}/>
              <Route path='/main' element={<Main/>}/>
              <Route path='/rank' element={<Rank/>}/>
              <Route path='/profile/*' element={<Profile/>}/>
              {/*<Route path='/game' element={<Game/>}/> */}
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </SocketContext.Provider>
	  </div>
  )
}