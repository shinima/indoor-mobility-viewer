# Indoor mobility viewer

# Readme is outdated!.

本文档列举了一些安装/开发/部署过程中需要了解注意的地方。

## 安装

运行`yarn install`来安装依赖

## 脚本

*package.json*中包含了一些脚本。

1. start脚本将启动webpack-dev-server用于进行开发；
2. build脚本用于打包工具，打包结果将会输出到*app/build*目录下，然后将*app/static*复制一份到*app/build*下；
3. storybook脚本可以用于浏览各个组件；
4. eslint脚本和eslint-fix是静态代码检查/修复工具。

## 部署

打包之后，以*build/*为root文件夹启动HTTP服务即可。目前版本的location-viewer暂时没有后台。

热度图用到了定位数据，定位数据较大（一周七个楼层的数据大概有700MB），所有并没有放在版本库中。定位数据文件的文件名格式为*YYYY-MM-DD.json*，位于*static/locations/*文件夹下。

目前location-viewer在[host-50:83](http://10.214.208.50:83)有一份部署。

## Magic Numbers

*app/components/Map/HeatMap.tsx*

`config`变量用来对热度图进行配置，`config.radius`字段用来控制热度图中每个数据点绘图的半径，具体配置见[heatmap.js的文档](https://www.patrick-wied.at/static/heatmapjs/docs.html#heatmap-configure)。`config.maxPerMs`字段用来决定[热度图的max配置](https://www.patrick-wied.at/static/heatmapjs/docs.html#heatmap-setDataMax)与时间长度的关系，默认的值为1/200K，在该配置下，一个坐标在一小时（3600K ms）中到达18(= 3600K * 1/200K)个数据点时，该坐标到达最热。(K表示千)

`HeatMapPage#render`方法中，`<FloorList max={span / 240} />`中的240表示：一个小时(3600K ms)内, 一个楼层达到15K(= 3600K / 240)的定位点数量, 则认为该楼层到达最热，在楼层选择控件中热度条到达最大。
