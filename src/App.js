import {Route,Switch} from 'react-router-dom';
import './App.css';
import DashBoard from './Pages/Dashboard';
import AppNavBar from './Layouts/app-nav-bar';
import Info from './Pages/Info';
import help from './Pages/Help';
import Faq from './Pages/FAQ';

function App() {
  return (
    <div className="App">
      <AppNavBar></AppNavBar>
      <Route path="/" component={DashBoard} exact></Route>
      <Route path="/Info" component={Info}></Route>
      <Route path="/help" component={help}></Route>
      <Route path="/faq" component={Faq}></Route>

    </div>
  );
}
 
export default App;