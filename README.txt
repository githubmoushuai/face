###环境要求：###
Ubuntu 16.04 amd64
必须使用python3

###运行前的准备：###
安装python3需要的包(安装命令pip3 install 包名==版本号)：
flask(1.0.2)
flask_cors
numpy(1.14.3)
dlib(19.10)
pandas(0.22.0)
如安装flask(1.0.2) 命令： pip3 install flask==1.0.2

配置文件face.conf，其中：
len是用户id长度
distance是人脸判定门限

运行前需要修改static/js/reg/reg.js和static/js/scan/scan.js中recoURL变量的ip地址，换成本机的

###运行：###
cd进入face目录
执行python3 face.pyc命令

在浏览器输入
https://本机ip:5000/reg 进入人脸注册页面
https://本机ip:5000/scan 进入人脸识别页面

