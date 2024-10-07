import React from 'react';
import { Provider } from 'react-redux';
import './App.css';
import HomeList from './Components/HomeList/HomeList';
import Navbar from './Components/Navbar/Navbar';
import { store } from './features/store';

const App = () => {
    const [selectedUser, setSelectedUser] = React.useState("None");

    const handleUserChange = (user) => {
        setSelectedUser(user);
    };

    return (
        <Provider store={store}>
            <div>
                <Navbar onUserChange={handleUserChange} />
                <HomeList selectedUser={selectedUser} />
            </div>
        </Provider>
    );
};

export default App;
