import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Login/Login';
import SignUp from './SignUp/SignUp';
import Verify from './Verify/Verify';

function App() {
  return (
  	<div className="App">
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<Login/>}/>
				<Route path='/signup' element={<SignUp/>}/>
				<Route path='/verify' element={<Verify/>}/>
				{/* <Route path='/main' element={<Main/>}/>
				<Route path='/rank' element={<Rank/>}/>
				<Route path='/profile' element={<Profile/>}/>
				<Route path='/game' element={<Game/>}/> */}
			</Routes>
		</BrowserRouter>
	</div>
  );
}

export default App;
