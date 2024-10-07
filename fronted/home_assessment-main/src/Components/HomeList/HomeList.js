import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHomesByUser } from '../../features/homeSlice';
import EditUserModel from '../EditUserModal/EditUserModel';
import styles from './HomeList.module.css';

const HomeList = ({ selectedUser }) => {
    const dispatch = useDispatch();
    const homes = useSelector((state) => state.homes.list);
    const status = useSelector((state) => state.homes.status);
    const [isEditVisible, setIsEditVisible] = React.useState(false);
    const [selectedHome, setSelectedHome] = React.useState(null);

    useEffect(() => {
        if (selectedUser !== "None") {
            dispatch(fetchHomesByUser(selectedUser));
        }
    }, [dispatch, selectedUser]);

    const handleClick = (home) => {
        setSelectedHome(home);
        setIsEditVisible(true);
    };

    return (
        <>
            <div className={`${styles.homesContainer}`}>
                {homes.map((home) => (
                    <div className={`${styles.homeCard}`} key={home.id}>
                        <h3>{home.name}</h3>
                        <p>Price: ${home.list_price}</p>
                        <p>State: {home.state}</p>
                        <p>Zip: {home.zip}</p>
                        <p>Sqft: {home.sqft} sqft</p>
                        <p>Beds: {home.beds}</p>
                        <p>Baths: {home.baths}</p>
                        <button className={`${styles.userBtn}`} onClick={() => handleClick(home)}>Edit Users</button>
                    </div>
                ))}
            </div>
            {isEditVisible && <EditUserModel homeId={selectedHome.id} homeName={selectedHome.name} setIsEditVisible={setIsEditVisible} />}
        </>
    );
};

export default HomeList;
