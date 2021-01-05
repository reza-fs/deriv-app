import React from 'react';
import { Icon, Text } from '@deriv/components';
import DetailGrid from './detail-grid.jsx';
import FileUploaderContainer from '../file-uploader-container/file-uploader-container.jsx';
import FileUploader from '../file-uploader-container/file-uploader.jsx';

const FilePending = ({ icon, description, title, getSocketFunc, onFileDrop, root_class }) => {
    const ref = React.useRef();

    return (
        <React.Fragment>
            <Icon icon={icon} size={236} />
            <Text as='p' size='s' weight='bold' color='prominent'>
                {title}
            </Text>
            <Text as='p' size='xs'>
                {description}
            </Text>
            <FileUploaderContainer>
                <FileUploader getSocket={getSocketFunc} ref={ref} onFileDrop={onFileDrop} />
            </FileUploaderContainer>
            <DetailGrid root_class={root_class} />
        </React.Fragment>
    );
};

export default FilePending;
