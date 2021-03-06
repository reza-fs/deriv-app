import React from 'react';
import { Checkbox } from '@deriv/components';

/*
 * This component is used with Formik's Field component.
 */
const CheckboxField = ({ field: { name, value, onChange }, id, label, className, ...props }) => {
    return (
        <div className={className}>
            <Checkbox value={value} name={name} label={label} onChange={onChange} {...props} />
        </div>
    );
};

export default CheckboxField;
