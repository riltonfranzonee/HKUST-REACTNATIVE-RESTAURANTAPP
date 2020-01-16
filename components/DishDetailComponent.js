import React from 'react'
import {View, Text} from 'react-native'
import {Card} from 'react-native-elements'
import {DISHES} from '../shared/dishes'


function RenderDish(props){
    const dish = props.dish

    if(dish != null){
        return(
            <Card
            featuredTitle={dish.name}
            image={require('./images/uthappizza.png')}
            >
                <Text style={{margin: 10}}>
                    {dish.description}
                </Text>
            </Card>
        )
    }
    else{
        return(<View></View>)
    }
}

class Dishdetail extends React.Component{

    state={
        dishes: DISHES
    }

    static navigationOptions = {
        title: 'Dish Details'
    }

    render(){
        const dishId = this.props.navigation.getParam('dishId', '')

        return(<RenderDish dish={this.state.dishes.filter(dish => dish.id == dishId)[0]}/>)
}
}

export default Dishdetail