import React from 'react';
import { Upload, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile, RcFile } from 'antd/lib/upload/interface';
import { getOssFormData } from '@/config/oss';
import { getBase64 } from '@/config/fileToBase';
import { GetOssInfo } from '@/config/api/request/ossUpload';

const uploadButton = (
  <div>
    <PlusOutlined />
    <div style={{ marginTop: 8 }}>Upload</div>
  </div>
);

interface UploadProps {
  imageList?: {
    uid: number | string;
    name: string;
    status: string;
    url: string;
  }[];
  length?: number;
  accept?: string;
  size?: number;
  onChange?: (images: string[]) => void;
  keyName?: number;
}

export interface UploadRef {
  getImageList: () => string[];
}

function UploadDom(props: UploadProps, ref: React.Ref<any>) {
  const { length, accept, imageList: images } = props;
  // @ts-ignore
  const [fileList, setFileList] = React.useState<UploadFile<any>[]>(
    images || [],
  );
  const [imgData, setImgData] = React.useState({
    previewVisible: false,
    previewTitle: '',
    previewImage: '',
  });
  const [signature, setSignature] = React.useState<{
    policy: string;
    access_id: string;
    signature: string;
    expire: string;
    url: string;
    key: string;
  }>();

  const tempImages: { [prop: string]: string } = {};
  if (Array.isArray(images)) {
    images.forEach((item) => {
      tempImages[item.uid as string] = item.url;
    });
  }

  const [imageList, setImageList] =
    React.useState<{ [prop: string]: string }>(tempImages);

  React.useImperativeHandle(ref, () => ({
    getImageList: () => {
      return Object.values(imageList);
    },
  }));

  React.useEffect(() => {
    GetOssInfo().then((res) => {
      if (res.code === 200) {
        const signature = res.data;
        setSignature(signature);
      } else {
        return Promise.reject(res);
      }
    });
  }, []);
  return (
    <div>
      <Upload
        accept={accept || 'image/*'}
        customRequest={async (uploadObj) => {
          const { file } = uploadObj;
          const size = (props.size && props.size) || 1;
          if (size * 1024 * 1024 < (file as RcFile).size) {
            message.error(`超过上传限制大小 ${size}mb`);
            return;
          }
          if (signature) {
            const formData = getOssFormData(signature);
            // @ts-ignore
            const path = signature.key + '/' + file.name;
            formData.append('key', path);
            formData.append('file', file);
            fetch(signature.url, {
              method: 'post',
              body: formData,
              mode: 'cors',
            }).then((body) => {
              if (body.status === 200) {
                // @ts-ignore
                uploadObj.onSuccess();
                // @ts-ignore
                imageList[file.uid] = signature.url + '/' + path;
                setImageList(imageList);
                if (props.onChange) {
                  props.onChange(Object.values(imageList));
                }
              } else {
                // @ts-ignore
                uploadObj.onError({});
              }
            });
          }
        }}
        listType="picture-card"
        fileList={fileList}
        onPreview={async (file) => {
          if (!file.url && !file.preview) {
            file.preview = (await getBase64(
              file.originFileObj as RcFile,
            )) as string;
          }

          if (!file.url) {
            file.url = '';
          }

          setImgData({
            previewImage: file.url || file.preview || '',
            previewVisible: true,
            previewTitle:
              file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
          });
        }}
        onChange={({ fileList, file }) => {
          const size = (props.size && props.size) || 1;
          if (size * 1024 * 1024 < (file as RcFile).size) {
            return;
          }
          setFileList(fileList);
        }}
        onRemove={(file) => {
          delete imageList[file.uid];
          setImageList(imageList);
        }}
      >
        {fileList.length < (length || 3) ? uploadButton : null}
      </Upload>
      <Modal
        visible={imgData.previewVisible}
        title={imgData.previewTitle}
        footer={null}
        onCancel={() => {
          const obj = { ...imgData };
          obj.previewVisible = false;
          setImgData(obj);
        }}
      >
        <img
          alt="example"
          style={{ width: '100%' }}
          src={imgData.previewImage}
        />
      </Modal>
    </div>
  );
}

export default React.forwardRef(UploadDom);
