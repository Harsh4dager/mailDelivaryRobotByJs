// Given network of roads in the village Meadowfield
const roads = [
    "Alice's House-Bob's House", "Alice's House-Cabin",
    "Alice's House-Post Office", "Bob's House-Town Hall",
    "Daria's House-Ernie's House", "Daria's House-Town Hall",
    "Ernie's House-Grete's House", "Grete's House-Farm",
    "Grete's House-Shop", "Marketplace-Farm",
    "Marketplace-Post Office", "Marketplace-Shop",
    "Marketplace-Town Hall", "Shop-Town Hall"
];

// Building a graph through this
function buildGraph(edges){
    let graph = Object.create(null);
    function addEdge(from, to){
        if(from in graph){
            graph[from].push(to);
        }
        else{
            graph[from] = [to];
        }
    }

    for(let [from, to] of edges.map(r => r.split("-"))){
        addEdge(from, to);
        addEdge(to, from);
    }
    return graph;
}

const roadGraph = buildGraph(roads);

// Define VillageState
class VillageState {
    constructor(place, parcels) {
        this.place = place; // refers to the current position of the robot
        this.parcels = parcels; // an array of parcels, where each parcel is an object containing {current_location , address_of_destination} 
    }

    // The move method will move the robot to destination and return the updated VillageState.
    move(destination) {
        // Check if there is a road from current location to destination, if not return this state again;
        if (!roadGraph[this.place].includes(destination)) return this;
        else {
            // Updating the parcels array
            let parcels = this.parcels.map(p => {
                if (p.place != this.place) return p; // If parcel is not at robot's current place it remains unchanged.
                return {place: destination, address: p.address}; // Else if parcel at the robot's current place move to destination.
            }).filter(p => p.place != p.address);

            return new VillageState(destination, parcels);
        }
    }
}

// Function to run robot
function runRobot(state, robot, memory) {
    for (let turn = 0; ; turn++) {
        if (state.parcels.length == 0) {
            console.log(`Done in ${turn} turns`);
            break;
        } else {
            // The thing a robot returns is an object containing both
            // the direction it wants to move in and a memory value that will be given back
            // to it the next time it is called.
            let action = robot(state, memory);

            // Update the new village state and the memory
            state = state.move(action.direction);
            memory = action.memory;
            console.log(`Moved to ${action.direction}`);
        }
    }
}

// Function to randomly pick an element from an array
function randomPick(arr) {
    let choice = Math.floor(Math.random() * arr.length);
    return arr[choice]; // Returning any random array element
}

// Random robot function
function randomRobot(state) {
    // This robot does not need to remember anything, it ignores its second
    // argument (remember that JavaScript functions can be called with extra arguments
    // without ill effects) and omits the memory property in its returned object.
    return {direction: randomPick(roadGraph[state.place])};
}

// Create a new state with some parcels
VillageState.random = function(parcelCount = 5) {
    let parcels = [];
    for (let i = 0; i < parcelCount; i++) {
        let address = randomPick(Object.keys(roadGraph));
        let place;
        do {
            place = randomPick(Object.keys(roadGraph));
        } while (place == address); // We don't want the place and destination to be the same.
        parcels.push({place, address});
    }
    return new VillageState("Post Office", parcels);
}

// Route-following robot using a predefined mail route
const mailRoute = [
    "Alice's House", "Cabin", "Alice's House", "Bob's House",
    "Town Hall", "Daria's House", "Ernie's House",
    "Grete's House", "Shop", "Grete's House", "Farm",
    "Marketplace", "Post Office"
];

function routeRobot(state, memory) {
    if (memory.length == 0) {
        memory = mailRoute;
    }
    // Move robot to first place from route and remove that place from mailRoute.
    return {direction: memory[0], memory: memory.slice(1)};
}

// Function to find the shortest route using BFS
function findRoute(graph, from, to) {
    let work = [{at: from, route: []}];
    for (let i = 0; i < work.length; i++) {
        let {at, route} = work[i];
        for (let place of graph[at]) {
            if (place == to) return route.concat(place);
            if (!work.some(w => w.at == place)) {
                work.push({at: place, route: route.concat(place)});
            }
        }
    }
}

// Goal-oriented robot
function goalOrientedRobot({place, parcels}, route) {
    if (route.length == 0) {
        let parcel = parcels[0];
        if (parcel.place != place) {
            route = findRoute(roadGraph, place, parcel.place);
        } else {
            route = findRoute(roadGraph, place, parcel.address);
        }
    }
    return {direction: route[0], memory: route.slice(1)};
}

// Start the virtual world with the goal-oriented robot
runRobot(VillageState.random(), goalOrientedRobot, []);
