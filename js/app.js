"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// 在页面中渲染app组件
// 第一步引入库的方法，render，Component
var render = ReactDOM.render;
var Component = React.Component;
// 定义工具方法Util
var Util = {
    /**
     * 通过get请求方式获取异步数据
     * @url 	表示请求地址
     * @fn 		请求成功时候的回调函数
     */
    ajax: function (url, fn) {
        // 创建xhr对象
        var xhr = new XMLHttpRequest();
        // 做监听
        xhr.onreadystatechange = function () {
            // 监听readystate是4
            if (xhr.readyState === 4) {
                // 判断请求成功
                if (xhr.status === 200) {
                    // 处理请求成功的数据
                    var res = JSON.parse(xhr.responseText);
                    // 在回调函数中处理这个数据
                    fn && fn(res);
                }
            }
        };
        // 打开请求并发送数据
        xhr.open('GET', url, true);
        xhr.send(null);
    },
    /**
     * 定义将对象转化成url参数的方法
     * @obj 	参数对象
     * return 	url的query参数
     * {a: 1, b: 2}  => ?a=1&b=2
     */
    ObjToQuery: function (obj) {
        var result = '';
        // 遍历obj转化
        for (var i in obj) {
            result += '&' + i + '=' + obj[i];
        }
        // 上边得到的结果是 &a=1&b=2 => ?a=1&b=2
        return '?' + result.slice(1);
    }
};
// 三个页面的头部是公用的，因此将头部组件提取抽象出来
var Header = (function (_super) {
    __extends(Header, _super);
    function Header() {
        _super.apply(this, arguments);
    }
    Header.prototype.render = function () {
        return (React.createElement("header", {className: "header"}, 
            React.createElement("div", {className: "arrow-container", onClick: this.props.goBack}, 
                React.createElement("span", {className: "arrow"}, 
                    React.createElement("span", {className: "arrow blue"})
                )
            ), 
            React.createElement("span", {className: "login"}, "登录"), 
            React.createElement("h1", null, "腾讯体育新闻")));
    };
    return Header;
}(Component));
// 我们有三个页面，所以要定义三个组件
// 定义列表页组件
var List = (function (_super) {
    __extends(List, _super);
    function List() {
        _super.apply(this, arguments);
    }
    // 定义点击列表元素的方法
    //希望chooseNews在执行的时候，作用域是this，用bind方法
    List.prototype.chooseNews = function (id) {
        // console.log(e)
        // 获取这条新闻的id，可以通过当前元素的data-id属性获取
        // let id = e.target.getAttribute('data-id')
        // console.log(id)
        // 将id传递给父组件，然后，在父组件中根据新闻的id请求异步数据，然后渲染页面
        // 获取父组件传递的方法
        this.props.showDetail(id);
    };
    // 创建列表的,返回值就是列表中的li元素集合
    List.prototype.createList = function () {
        var _this = this;
        return this.props.data.map(function (obj, index) {
            // 创建每一个li元素
            return (React.createElement("li", {"data-id": obj.id, key: index, onClick: _this.chooseNews.bind(_this, obj.id)}, 
                React.createElement("img", {src: obj.img, alt: ""}), 
                React.createElement("div", null, 
                    React.createElement("h3", null, obj.title), 
                    React.createElement("p", null, 
                        obj.content, 
                        React.createElement("span", {className: "list-comment"}, 
                            "评论：", 
                            obj.comment)))));
        });
    };
    List.prototype.render = function () {
        return (React.createElement("ul", {className: "list"}, this.createList()));
    };
    return List;
}(Component));
// 定义详情页
var Detail = (function (_super) {
    __extends(Detail, _super);
    function Detail() {
        _super.apply(this, arguments);
    }
    // 定义点击按钮显示评论页的回调函数
    Detail.prototype.showComment = function (e) {
        var id = e.currentTarget.getAttribute('data-id');
        this.props.showComment(id);
    };
    Detail.prototype.render = function () {
        // 缓存data数据
        var data = this.props.data;
        // 定义内容
        var content = {
            __html: data.content
        };
        return (React.createElement("div", {className: "detail"}, 
            React.createElement("h1", null, data.title), 
            React.createElement("p", {className: "detail-intro"}, 
                React.createElement("span", {className: "detail-time"}, data.time), 
                React.createElement("span", {className: "detail-comment"}, 
                    "评论：", 
                    data.comment)), 
            React.createElement("img", {src: data.img, alt: ""}), 
            React.createElement("p", {className: "detail-content", dangerouslySetInnerHTML: content}), 
            React.createElement("span", {className: "detail-comment-btn", "data-id": data.id, onClick: this.showComment.bind(this)}, "查看更多评论")));
    };
    return Detail;
}(Component));
// 定义评论页
var Comment = (function (_super) {
    __extends(Comment, _super);
    function Comment(props) {
        // 继承props
        _super.call(this, props);
        // 将属性中的data数据转化成状态中给的data数据
        this.state = {
            // 此时状态中 的数据是可以在组件中改变的，我们可以向其添加新增的评论数据了
            data: props.data
        };
    }
    // 在存在期第一个阶段更新状态
    Comment.prototype.componentWillReceiveProps = function (nextProps) {
        this.setState({
            data: nextProps.data
        });
    };
    // 定义渲染评论列表方法
    Comment.prototype.createCommentList = function () {
        // 根据data数据中的list渲染
        return this.state.data.list.map(function (obj, index) {
            // 渲染每一条列表评论
            return (React.createElement("li", {key: index}, 
                React.createElement("h3", null, obj.user), 
                React.createElement("p", null, obj.content), 
                React.createElement("span", null, obj.time)));
        });
    };
    // 定义提交评论事件
    Comment.prototype.commentCommit = function () {
        // 获取输入框的内容
        var val = this.refs.commentTextarea.value;
        // 输入校验
        if (val === '') {
            alert('请您输入内容！');
            return;
        }
        this.submitData(val);
    };
    // 提交评论数据
    Comment.prototype.submitData = function (val) {
        var _this = this;
        // 创建日期
        var date = new Date();
        var data = {
            user: 'yyqh',
            content: val,
            time: '刚刚 ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
        };
        // 定义请求路径
        var url = 'data/addComment.json' + Util.ObjToQuery(data);
        Util.ajax(url, function (res) {
            if (res && res.errno === 0) {
                // 更新评论
                // 缓存原有的数据
                var stateData = _this.state.data;
                // 更新数据
                stateData.list.push(data);
                // 通知组件
                _this.setState({
                    data: stateData
                });
                // 将textarea 清空
                _this.refs.commentTextarea.value = '';
                alert('恭喜您，提交成功！');
            }
        });
    };
    Comment.prototype.render = function () {
        // console.log(this.props, this.state)
        return (React.createElement("div", {className: "comment"}, 
            React.createElement("div", {className: "input-container"}, 
                React.createElement("textarea", {ref: "commentTextarea", placeholder: "文明上网，理性发言！"}), 
                React.createElement("span", {className: "comment-btn", onClick: this.commentCommit.bind(this)}, "发布")), 
            React.createElement("ul", null, this.createCommentList())));
    };
    return Comment;
}(Component));
// 创建一个组件，在react中用es6编程，通过class来定义组件的,一定要继承Component类，因为component类提供了一些react组件基本的方法
var App = (function (_super) {
    __extends(App, _super);
    // 三个页面不能同时出现，可以定义一个状态来控制他们
    // Es6的构造函数已经实现了getDefaultProps和getInitialState两个方法
    function App(props) {
        _super.call(this, props);
        // 定义初始化状态
        this.state = {
            // 定义一个section属性，来决定显示哪个页面
            // 现在切换页面只需要更改section属性值就可以
            section: 'list',
            listData: [],
            detailData: {},
            commentData: {
                list: []
            }
        };
        this.scrollPos = {
            list: 0,
            detail: 0,
            comment: 0
        };
    }
    // 页面创建完成之后发送异步请求请求列表数据
    App.prototype.componentDidMount = function () {
        var _this = this;
        Util.ajax('data/list.json', function (res) {
            // 将数据传递给列表组件
            // console.log(res)
            if (res.errno === 0) {
                _this.setState({
                    listData: res.data
                });
            }
        });
    };
    // 定义getNewsDetailData
    // id表示新闻的id
    App.prototype.showDetail = function (id) {
        var _this = this;
        // console.log(this)
        // console.log(123, id)
        // 根据这个id获取数据
        Util.ajax('data/detail.json?id=' + id, function (res) {
            // console.log(this, 111)
            // 将数据保存在state中传递给Detail组件，并且显示该组件
            if (res.errno === 0) {
                _this.setState({
                    // 保存数据
                    detailData: res.data,
                    // 显示detail
                    section: 'detail'
                });
                window.scrollTo(0, 0);
            }
        });
    };
    // 根据id请求评论
    App.prototype.showComment = function (id) {
        var _this = this;
        // 根据id请求数据
        Util.ajax('data/comment.json', function (res) {
            // 判断请求数据
            if (res && res.errno === 0) {
                // 保存数据并显示评论页
                _this.setState({
                    // 保存数据
                    commentData: res.data,
                    // 显示评论页
                    section: 'comment'
                });
                window.scrollTo(0, 0);
            }
        });
    };
    App.prototype.goBack = function () {
        // 在哪个页面判断section就可以了
        switch (this.state.section) {
            // 如果是在列表页，点击无反应
            case "list":
                break;
            // 如果是在详情页，点击进入列表页
            case "detail":
                this.setState({
                    section: 'list'
                });
                window.scrollTo(0, this.scrollPos.list);
                this.scrollPos.list = 0;
                break;
            // 如果是在评论页，点击进入详情页
            case "comment":
                this.setState({
                    section: 'detail'
                });
                window.scrollTo(0, this.scrollPos.detail);
                this.scrollPos.detail = 0;
                break;
        }
    };
    // 定义render方法输出虚拟dom
    App.prototype.render = function () {
        // 缓存section变量
        var section = this.state.section;
        return (React.createElement("div", null, 
            React.createElement(Header, {goBack: this.goBack.bind(this)}), 
            React.createElement("section", {className: "lsit", style: { display: section === 'list' ? 'block' : 'none' }}, 
                React.createElement(List, {data: this.state.listData, showDetail: this.showDetail.bind(this)})
            ), 
            React.createElement("section", {className: "detail", style: { display: section === 'detail' ? 'block' : 'none' }}, 
                React.createElement(Detail, {data: this.state.detailData, showComment: this.showComment.bind(this)})
            ), 
            React.createElement("section", {className: "comment", style: { display: section === 'comment' ? 'block' : 'none' }}, 
                React.createElement(Comment, {data: this.state.commentData})
            )));
    };
    App.prototype.componentDidUpdate = function (oldProps, oldState) {
        this.scrollPos[oldState.section] = window.scrollY * 2;
    };
    return App;
}(Component));
// 将app渲染到页面中
render(React.createElement(App, null), document.getElementById('app'));
