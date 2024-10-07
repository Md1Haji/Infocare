import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../../features/userSlice';
import styles from './Navbar.module.css';

const Navbar = ({ onUserChange }) => {
    const dispatch = useDispatch();
    const users = useSelector((state) => state.users.list);
    const status = useSelector((state) => state.users.status);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchUsers());
        }
    }, [dispatch, status]);

    const handleChange = (e) => {
        onUserChange(e.target.value);
    };

    return (
        <div className={`${styles.container}`}>
            <div className={`${styles.wrapper}`}>
                <p>Select User: &nbsp;</p>
                <select className={styles.select} onChange={handleChange}>
                    <option disabled value="None">None</option>
                    {users.map((user) => (
                        <option key={user} value={user}>{user}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default Navbar;
