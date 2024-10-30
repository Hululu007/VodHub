import queryString from 'query-string';

import { NAN_GUA_CONFIG } from './config';
import { namespace } from './namespace';
import request from './request';

import { HomeVodData, HomeVodRoute } from '@/types';
import logger from '@/utils/logger';

// 源头的最近更新数据
interface HomeVodDataOrigin {
    slide: {
        data: Array<{
            id: number;
            url: string | number;
            name: string;
            img: string;
            type: number;
            jumpurl: string;
        }>;
        ads: {
            type: number;
            msg: string;
            code: string | number;
        };
    };
    video: Array<{
        id: number;
        name: string;
        icon: string;
        ads: {
            type: number;
            msg: string;
            code: string | number;
        };
        style_type: number;
        style_num: number;
        vod_more: {
            name: string;
            type: number;
            url: string | number;
        };
        data: Array<{
            id: number;
            type: number;
            name: string;
            qingxidu: string;
            img: string;
            msg: string;
            score: string;
            section: number;
        }>;
    }>;
}

const handler = async () => {
    try {
        logger.info(`正在获取最近更新 - ${namespace.name}`);

        const params = {
            app: NAN_GUA_CONFIG.app,
            devices: 'android',
            imei: NAN_GUA_CONFIG.imei,
            deviceModel: 'Subsystem for Android(TM)',
            deviceVersion: '33',
            appVersionName: '1.0.9',
            deviceScreen: '427*250',
            appVersionCode: '9',
            deviceBrand: 'Windows'
        };

        const strParams = queryString.stringify(params);

        let res = await request.post<HomeVodDataOrigin>(`${namespace.url}/api.php/provide/home_data?${strParams}`);

        const { video } = res;
        let vod_list: HomeVodData[] = [];

        video.forEach((item) => {
            item.data.forEach((vod) => {
                if (vod.qingxidu) {
                    vod_list.push({
                        vod_id: vod.id,
                        vod_name: vod.name,
                        vod_pic: vod.img,
                        vod_remarks: vod.msg
                    });
                }
            });
        });

        if (vod_list.length > 0) {
            return {
                code: 0,
                data: vod_list
            };
        }

        logger.error(`获取最近更新失败 - ${namespace.name} - ${JSON.stringify(res)}`);
        return {
            code: -1,
            data: []
        };
    } catch (error) {
        logger.error(`获取最近更新失败 - ${namespace.name} - ${error}`);
        return {
            code: -1,
            data: []
        };
    }
};

export const route: HomeVodRoute = {
    path: '/homeVod',
    name: 'homeVod',
    example: '/nangua/homeVod',
    description: `最近更新`,
    handler
};
