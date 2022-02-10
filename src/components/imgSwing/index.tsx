import { Carousel } from 'antd';
import {
  CaretLeftOutlined,
  CaretRightOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { CarouselRef } from 'antd/lib/carousel/index';
import './index.less';

export default function (props: {
  record: {
    imageList: string[];
  };
  setImgData: (params: {
    previewImage: string;
    previewVisible: boolean;
    previewTitle: string;
  }) => void;
}) {
  let activeRef: CarouselRef;
  const { record } = props;
  const lenMin = record.imageList.length === 1;
  const fontColor = lenMin ? '#eee' : '#333';
  const cursor = lenMin ? 'not-allowed' : undefined;

  return (
    <div className="flex-box">
      <CaretLeftOutlined
        style={{ color: fontColor, cursor }}
        onClick={() => {
          if (activeRef && !lenMin) {
            activeRef.prev();
          }
        }}
      />
      <Carousel
        ref={(ref) => {
          if (ref) {
            // @ts-ignore
            activeRef = ref;
          }
        }}
        className="carousel-box"
      >
        {record.imageList.map((filePath: string, ind: number) => {
          return (
            <div className="img-box" key={ind}>
              <img className="img" src={filePath} />
              <div className="show flex-box">
                <EyeOutlined
                  style={{ color: '#fff', fontSize: 18 }}
                  onClick={() => {
                    props.setImgData({
                      previewImage: filePath,
                      previewVisible: true,
                      previewTitle: '',
                    });
                  }}
                />
              </div>
            </div>
          );
        })}
      </Carousel>
      <CaretRightOutlined
        style={{ color: fontColor, cursor }}
        onClick={() => {
          if (activeRef && !lenMin) {
            activeRef.next();
          }
        }}
      />
    </div>
  );
}
