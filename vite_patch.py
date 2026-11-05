p='vite.config.js'
s=open(p,encoding='utf-8').read()
a="        server: {"
b='''        build: {
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (!id.includes('node_modules')) return undefined;
                        if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler|@remix-run)\//.test(id)) return 'vendor-react';
                        if (/node_modules\/(@reduxjs|redux|redux-persist|react-redux|reselect|immer|redux-thunk)\//.test(id)) return 'vendor-redux';
                        if (/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(id)) return 'vendor-motion';
                        if (/node_modules\/(swiper|ssr-window|dom7)\//.test(id)) return 'vendor-swiper';
                        if (/node_modules\/(@firebase|firebase)\//.test(id)) return 'vendor-firebase';
                        if (/node_modules\/(antd|@ant-design|rc-[^/]+|@rc-component|@ctrl|stylis|@emotion|dayjs|classnames)\//.test(id)) return 'vendor-antd';
                        return undefined;
                    },
                },
            },
        },
'''
assert s.count(a)==1
open(p,'w',encoding='utf-8',newline='').write(s.replace(a,b+a))
