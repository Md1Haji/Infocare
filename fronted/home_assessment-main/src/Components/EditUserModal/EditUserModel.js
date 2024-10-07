import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateUsersForHome } from '../../features/homeSlice';
import styles from './EditUserModel.module.css';

const EditUserModel = ({ setIsEditVisible, homeId, homeName }) => {
    const dispatch = useDispatch();
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`http://localhost:3001/user/find-by-home/${homeId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                setUsers(data);
                setSelectedUsers(data.map(user => user.username));
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [homeId]);

    const handleCheckboxChange = (username) => {
        setSelectedUsers((prevSelected) =>
            prevSelected.includes(username)
                ? prevSelected.filter((user) => user !== username)
                : [...prevSelected, username]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(updateUsersForHome({ homeId, usernames: selectedUsers }))
            .then(() => setIsEditVisible(false))
            .catch((err) => {
                setError('Failed to update users.');
                console.error(err);
            });
    };

    const handleCancel = () => {
        setIsEditVisible(false); // Close modal without saving
    };

    if (isLoading) {
        return <p>Loading users...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className={`${styles.modalContainer}`}>
            <div className={`${styles.editUContainer}`}>
                <h2>Modify Users for: {homeName}</h2>
                <form onSubmit={handleSubmit}>
                    {users.map((user) => (
                        <div key={user.username}>
                            <input
                                type="checkbox"
                                id={user.username}
                                name={user.username}
                                value={user.username}
                                checked={selectedUsers.includes(user.username)}
                                onChange={() => handleCheckboxChange(user.username)}
                            />
                            <label htmlFor={user.username}> {user.username}</label><br />
                        </div>
                    ))}
                    <br />
                    <div className={styles.buttonContainer}>
                        <input type="submit" value="Save" className={styles.submitBtn} />
                        <button type="button" onClick={handleCancel} className={styles.cancelBtn}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModel;
