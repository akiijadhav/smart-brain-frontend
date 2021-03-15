import React, {Component} from 'react';
import Particles from "react-particles-js";

import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import Navigation from './components/Navigation/Navigation';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import './App.css';



const particlesOptions = {
    particles: {
        line_linked: {
            shadow: {
                enable: false,
                color: "#3CA9D1",
                blur: 5
            }
        },
        number: {
            value: 50,
            density: {
                enable: true,
                value_area: 500
            }
        },
        size: {
            value: 3
        }
    }
}

const initialState = {
    input: '',
    imageUrl: '',
    boxes: [],
    route: 'signin',
    isSignedIn: false,
    user: {
        id: '',
        name: '',
        email: '',
        password: '',
        entries: 0,
        joined: ''
    }
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = initialState
    }

    loadUser = (data) => {
        this.setState({user: {
                id: data.id,
                name: data.name,
                email: data.email,
                entries: data.entries,
                joined: data.joined
            }})
    }

    onInputChange = (event) => {
        this.setState({input: event.target.value})
        // console.log(event.target.value);
    }

    calculateFaceLocations = (data) => {
        return data.outputs[0].data.regions.map(face => {
            const clarifaiFace = face.region_info.bounding_box;
            const image = document.getElementById('inputImage');
            const width = Number(image.width);
            const height = Number(image.height);
            // console.log(width, height); checking height & width of the image
            return {
                leftCol: clarifaiFace.left_col * width,
                topRow: clarifaiFace.top_row * height,
                rightCol: width - (clarifaiFace.right_col * width),
                bottomRow: height - (clarifaiFace.bottom_row * height)
            }
        })
    }

    // The box value is the return value from above
    // which is an object that gets passed
    displayFaceBoxes = (boxes) => {
        //logging the object values after calculation
        // console.log(box) dimensions
        this.setState({boxes: boxes});
    }

    onButtonSubmit = () => {
        this.setState({imageUrl: this.state.input})
        // console.log('calculating');
        fetch('https://floating-brook-37169.herokuapp.com/imageurl', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                input: this.state.input
            })
        })
            .then(response => response.json())
            // calculate response and pass it to calculateFacebox which
            // returns the bounding box which is then passed to state
            .then(response => {
                if(response){
                    fetch('https://floating-brook-37169.herokuapp.com/image', {
                        method: 'put',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            id: this.state.user.id
                        })
                    })
                        .then(response =>response.json())
                        .then(count => {
                            this.setState(Object.assign(this.state.user, { entries: count}))
                        })
                        .catch(console.log)
                }
                this.displayFaceBoxes(this.calculateFaceLocations(response))
            })
            //log error if any
            .catch((error) => console.log(error));
    }

    onRouteChange = (route) => {
        if (route === 'signout'){
            this.setState(initialState)
        } else if (route === 'home') {
            this.setState({isSignedIn: true})
        }
        this.setState({route: route})
    }

    render() {
        const { isSignedIn, imageUrl, route, boxes } = this.state;
        return (
            <div className="App">
                <Particles className='particles'
                           params={particlesOptions}
                />
                <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
                { route === 'home'
                    ? <div>
                        <Logo />
                        <Rank
                            name={this.state.user.name}
                            entries={this.state.user.entries}
                        />
                        <ImageLinkForm
                            onInputChange={this.onInputChange}
                            onButtonSubmit={this.onButtonSubmit}
                        />
                        <FaceRecognition boxes={boxes} imageUrl={imageUrl} />
                    </div>
                    : (
                        route === 'signin'
                            ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                    )
                }
            </div>
        );
    }
}

export default App;
