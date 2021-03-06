import React from 'react'
import {View, Text, ScrollView, FlatList, StyleSheet, Modal, TouchableOpacity, PanResponder, Share} from 'react-native'
import {Card, Icon, Input} from 'react-native-elements'
import { Rating, AirbnbRating } from 'react-native-ratings';
import Constants from 'expo-constants'
import { connect } from 'react-redux'
import { baseUrl } from '../shared/baseUrl'
import { postFavorite, postComment } from '../redux/ActionCreators'
import * as Animatable from 'react-native-animatable'



const mapStateToProps = state => {
    return{
        dishes: state.dishes,
        comments: state.comments,
        favorites: state.favorites
    }
}

const mapDispatchToProps = dispatch =>  ({
    postFavorite: dishId => dispatch(postFavorite(dishId)),
    postComment: comment => dispatch(postComment(comment))
})

function RenderDish(props){
    const dish = props.dish

    const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if ( dx > 50 )
            return true;
        else
            return false;
    }

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
        onPanResponderEnd: (e, gestureState) => {
            console.log("pan responder end", gestureState);
            if (recognizeDrag(gestureState))
                 props.toggleModal()
            return true;
        }
    })
    
    const shareDish = (title, message, url) => {
        Share.share({
            title,
            message: title+ ': ' + message + ' ' + url,
            url
        },{
            dialogTitle: 'Share ' + title
        })
    }


    if(dish != null){
        return(
            <>
            <Animatable.View animation='fadeInDown' duration={2000} delay={1000} {...panResponder.panHandlers}>
                <Card
                featuredTitle={dish.name}
                image={{uri: baseUrl + dish.image}}
                >
                    <Text style={{margin: 10}}>
                        {dish.description}
                    </Text>
                    <View style={styles.iconRow}>
                        <Icon raised reverse name={ props. favorite ? 'heart' : 'heart-o'} type='font-awesome' color='#f50'
                        onPress={() => props.favorite ? console.log('already favorite') : props.onPress() }/>
                        <Icon raised reverse name='pencil' type='font-awesome' color='#512DA8'
                        onPress={() => props.toggleModal() }/>
                        <Icon raised reverse name='share' type='font-awesome' color='#51d2a8'
                        onPress={() => shareDish(dish.name, dish.description, baseUrl + dish.image) }/>
                    </View>
                </Card>
            </Animatable.View>
            </>
        )
    }
    else{
        return(<View></View>)
    }
}

function RenderComments(props){
    const comments = props.comments

    const renderCommentItem = ({item, index}) => {
        return(
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 18}}>{item.comment}</Text>
                <Text style={{fontSize: 12, marginVertical: 10}}><Rating ratingCount={5} startingValue={item.rating} readonly={true} imageSize={20}/></Text>
                <Text style={{fontSize: 12, fontWeight: 'bold'}}>{item.author + ', ' + item.date}</Text>
            </View>
        )
    }
    
    return(
       <Animatable.View animation='fadeInUp' duration={2000} delay={1000}>
            <Card title='Comments'>
                <FlatList data={comments} renderItem={renderCommentItem} keyExtractor={item => item.id.toString()}/>
            </Card>
        </Animatable.View>
    )
}

class DishDetail extends React.Component{
     state={
        showModal: false,
        rating: '',
        author: '',
        comment: ''
     }

    toggleModal = () => {
        this.setState({showModal: !this.state.showModal})
    }

    static navigationOptions = {
        title: 'Dish Details'
    }

    markFavrite = dishId =>{
        this.props.postFavorite(dishId)
    }

    handleComment = dishId => {
       const comment = {
            dishId: dishId,
            rating: this.state.rating,
            author: this.state.author,
            comment: this.state.comment
        }
        this.props.postComment(comment)
    }


    render(){
        const dishId = this.props.navigation.getParam('dishId', '')

        return(
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]} 
                    favorite={this.props.favorites.some(el => el === dishId)} 
                    onPress={() => this.markFavrite(dishId)}
                    toggleModal={() => this.toggleModal()}
                    />
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
                <Modal 
                    animationType="slide"
                    transparent={false}
                    visible={this.state.showModal}>
                    <View style={styles.modal}>
                    {/* USE ON FINISH RATING TO HANDLE THE RATING DATA */}
                        <Rating
                        ratingCount={5}
                        defaultRating={5}
                        size={20}
                        showRating
                        minValue={1}
                        onFinishRating={rating => this.setState({rating})}
                        />
                        <Input
                            placeholder='Author name'
                            value={this.state.author}
                            onChangeText={author => this.setState({author})}
                            leftIcon={
                                <Icon
                                name='user-o'
                                size={24}
                                color='black'
                                type='font-awesome'
                                paddingHorizontal={10}
                                />
                            }
                            />
                            <Input
                            placeholder='Comment'
                            value={this.state.comment}
                            onChangeText={comment => this.setState({comment})}
                            leftIcon={
                                <Icon
                                name='comment-o'
                                size={24}
                                color='black'
                                type='font-awesome'
                                paddingHorizontal={10}
                                />
                            }
                            />
                        <View style={styles.btnWrapper}> 
                            <TouchableOpacity style={[styles.btn, styles.btnSumbit]} 
                            onPress={() => {this.handleComment(dishId); this.toggleModal()}}
                            >
                                <Text style={styles.btnText}>SUBMIT</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={this.toggleModal}>
                                <Text style={styles.btnText}>CANCEL</Text>
                            </TouchableOpacity>
                        </View>  
                    </View>

                </Modal>
             </ScrollView>
             
        )
}
}

const styles = StyleSheet.create({
    iconRow:{
        flexDirection: 'row',
        justifyContent: 'center'
    },
    modal:{
        marginTop: Constants.statusBarHeight + 10
    },
    btn:{
        width: 400,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginBottom: 10
    },
    btnWrapper:{
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnSumbit: {
        backgroundColor: '#512DA8'
    },
    btnCancel:{
        backgroundColor: '#A0A0A0'
    },
    btnText:{
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 17
    }
})


export default connect(mapStateToProps, mapDispatchToProps)(DishDetail)