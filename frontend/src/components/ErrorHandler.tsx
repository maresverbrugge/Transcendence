import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { emitter } from './emitter';
import AlertMessage from './AlertMessage';

const ErrorHandler = () => {
    const navigate = useNavigate();
    const [alert, setAlert] = useState<string>('');

    useEffect(() => {
        emitter.on('alert', setAlert);
        emitter.on('error', handleError);

        return () => {
            emitter.off('alert');
            emitter.off('error');
        };
    }, []);

    const handleError = (error: any) => {
        if (error?.status === 403 || error?.status === 400) {
            if (error?.response?.data?.message) setAlert(error.response.data.message);
            else if (error?.response?.message) setAlert(error.response.message);
        } else if (error?.status === 401) {
            navigate('/logout');
        } else setAlert('An unexpected error occurred');
    };

    return (
        <>
            {alert && (
                <AlertMessage
                    message={alert}
                    onClose={() => setAlert(null)}
                />
            )}
        </>
    );
    
};

export default ErrorHandler;
