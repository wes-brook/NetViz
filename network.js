/* ==============================================================================================================================
 * File: network.js
 * Date: 11/3/2024
 * Author: Wesly Barayuga
 * Purpose: Implementation of a network simulation that models router behaviors, node and link failures,
 *          and calculates shortest paths within a dynamically changing graph.
 *
 * Features:    >> constructor()                        Initializes the network and visualizes it
 *              >> log(message)                         Handles logging with timestamp
 *              >> formatDateTime(date)                 Formats the current date and time for logging
 *              >> initializeRouters()                  Initializes routers and adds them to the network
 *              >> createNetworkEdges()                 Sets up edges between routers with failure probabilities
 *              >> addEdgeWithFailure(from, to, cost)   Adds a link between routers with a failure chance
 *              >> startSimulation()                    Starts the simulation of network conditions
 *              >> setupToggleButton()                  Sets up event listener for pause/resume functionality
 *              >> checkNodeFailures()                  Checks and updates the failure status of nodes
 *              >> checkLinkFailures()                  Checks and updates the failure status of links
 *              >> findShortestPath(start, end)         Uses Dijkstra's algorithm to find the shortest path
 *              >> visualizeNetwork()                   Updates the network visualization based on current state
 *
 * User Notice:
 *  - This simulation visualizes a mesh network with nodes (routers) and edges (links)
 *  - Nodes can fail randomly, affecting the network's routing capabilities
 *  - The simulation checks for node and link failures periodically
 *  - It calculates and displays the shortest path from Router-1 to Router-20
 * ============================================================================================================================== */


import Graph from "./graph.js";

class Network {
    constructor() {
        this.networkGraph = new Graph();
        this.nodeFailures = {};
        this.linkFailures = {};
        this.isPaused = false; // Track simulation state
        this.simulationInterval = null; // Store the interval ID
        this.initializeRouters();
        this.visualizeNetwork();
        this.setupToggleButton(); // Set up the button event
        this.startSimulation(); // Start the simulation
    }

    // Logging function to handle log updates with a consistent format
    log(message) {
        const logArea = document.getElementById('log');
        if (message === "") {
            logArea.innerHTML += "<br>";
        } else {
            logArea.innerHTML += `${this.formatDateTime(new Date())} - ${message}<br>`;
        }
        logArea.scrollTop = logArea.scrollHeight;
    }

    // Format the date and time for logging
    formatDateTime(date) {
        return date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
    }

    // Initialize routers in the network
    initializeRouters() {
        this.log("Initializing network...");
        const routers = Array.from({ length: 20 }, (_, i) => `Router-${i + 1}`);

        routers.forEach(router => {
            this.networkGraph.addVertex(router);
            this.nodeFailures[router] = Math.random() < 0.2; // 20% failure probability
            this.log(`Node ${router} initialized with failure status: ${this.nodeFailures[router]}`);
        });

        // Add edges with costs and initialize link failure probabilities
        this.createNetworkEdges();
        this.networkGraph.show();
    }

    // Create network edges with failure probabilities
    createNetworkEdges() {
        const edges = [
            ['Router-1', 'Router-2', 1], ['Router-1', 'Router-3', 2],
            ['Router-1', 'Router-4', 2], ['Router-2', 'Router-4', 3],
            ['Router-2', 'Router-5', 2], ['Router-3', 'Router-6', 3],
            ['Router-4', 'Router-5', 4], ['Router-4', 'Router-7', 2],
            ['Router-5', 'Router-8', 1], ['Router-6', 'Router-8', 2],
            ['Router-7', 'Router-9', 1], ['Router-8', 'Router-10', 3],
            ['Router-10', 'Router-11', 1], ['Router-10', 'Router-12', 2],
            ['Router-11', 'Router-13', 3], ['Router-12', 'Router-14', 4],
            ['Router-13', 'Router-15', 1], ['Router-14', 'Router-16', 2],
            ['Router-15', 'Router-17', 3], ['Router-16', 'Router-18', 2],
            ['Router-17', 'Router-19', 1], ['Router-18', 'Router-20', 4],
            ['Router-19', 'Router-20', 2]
        ];

        edges.forEach(edge => this.addEdgeWithFailure(...edge));
    }

    addEdgeWithFailure(from, to, cost) {
        const edgeExists = this.networkGraph.graph[from].some(edge => edge.vertex === to) ||
                           this.networkGraph.graph[to].some(edge => edge.vertex === from);
        if (!edgeExists) {
            this.networkGraph.addEdge(from, to, cost);
            this.linkFailures[`${from}-${to}`] = Math.random() < 0.1; // 10% failure probability
            this.log(`Link from ${from} to ${to} initialized with cost ${cost} and failure status: ${this.linkFailures[`${from}-${to}`]}`);
        } else {
            this.log(`Link between ${from} and ${to} already exists, skipping.`);
        }
    }

    startSimulation() {
        this.simulationInterval = setInterval(() => {
            if (!this.isPaused) {
                this.log("Simulating network failures...");
                this.checkNodeFailures();
                this.checkLinkFailures();

                const path = this.findShortestPath('Router-1', 'Router-20');
                if (path) {
                    this.log(`Current shortest path from Router-1 to Router-20: ${path.join(' -> ')}`);
                } else {
                    this.log("No available path from Router-1 to Router-20 due to failures.");
                }

                this.visualizeNetwork(); // Update visualization after each failure check
            }
        }, 5000); // Check every 5 seconds
    }

    setupToggleButton() {
        const toggleButton = document.getElementById('toggleButton');
        toggleButton.addEventListener('click', () => {
            this.isPaused = !this.isPaused; // Toggle pause state
            toggleButton.textContent = this.isPaused ? 'Resume Simulation' : 'Pause Simulation';
            this.log(this.isPaused ? "Simulation paused." : "Simulation resumed.");
        });
    }

    checkNodeFailures() {
        for (const node in this.nodeFailures) {
            if (Math.random() < 0.1) { // 10% chance of failure each check
                this.nodeFailures[node] = !this.nodeFailures[node]; // Toggle state
                this.log(`${node} failure status updated to: ${this.nodeFailures[node]}`);
            }
        }
    }

    checkLinkFailures() {
        for (const link in this.linkFailures) {
            if (Math.random() < 0.05) { // 5% chance of failure each check
                this.linkFailures[link] = !this.linkFailures[link]; // Toggle state
                this.log(`Link ${link} failure status updated to: ${this.linkFailures[link]}`);
            }
        }
    }

    findShortestPath(start, end) {
        this.log(`Finding shortest path from ${start} to ${end}...`);
        const distances = {};
        const previous = {};
        const queue = new Set();

        for (const node in this.networkGraph.graph) {
            distances[node] = Infinity;
            previous[node] = null;
            queue.add(node);
            this.log(`${node} initialized with distance: ${distances[node]}`);
        }
        distances[start] = 0;

        while (queue.size > 0) {
            let minNode = null;
            queue.forEach(node => {
                if (minNode === null || distances[node] < distances[minNode]) {
                    minNode = node;
                }
            });

            if (distances[minNode] === Infinity) {
                this.log(`No more accessible routers from ${start}.`);
                break; // All remaining nodes are inaccessible
            }

            queue.delete(minNode);
            this.log(`Visiting ${minNode} with current distance: ${distances[minNode]}`);

            for (const edge of this.networkGraph.graph[minNode]) {
                const neighbor = edge.vertex;
                if (this.nodeFailures[neighbor] || this.linkFailures[`${minNode}-${neighbor}`]) {
                    this.log(`Skipping neighbor ${neighbor} due to failure.`);
                    continue; // Skip failed nodes or links
                }
                const newDist = distances[minNode] + edge.cost;

                if (newDist < distances[neighbor]) {
                    distances[neighbor] = newDist;
                    previous[neighbor] = minNode;
                    this.log(`Updated distance for ${neighbor}: ${distances[neighbor]} via ${minNode}`);
                }
            }
        }

        const path = [];
        let currentNode = end;
        while (currentNode) {
            path.unshift(currentNode);
            currentNode = previous[currentNode];
        }
        const foundPath = path.length > 1 ? path : null;
        if (foundPath) {
            this.log(`Shortest path found: ${foundPath.join(' -> ')}`);
        } else {
            this.log(`No path found from ${start} to ${end}.`);
        }
        return foundPath; // Return null if no path found
    }

    visualizeNetwork() {
        const nodes = new vis.DataSet();
        const edges = new vis.DataSet();
    
        for (const vertex in this.networkGraph.graph) {
            const isFailed = this.nodeFailures[vertex];
            nodes.add({
                id: vertex,
                label: vertex,
                color: isFailed ? 'red' : 'green',
                shadow: {
                    enabled: true,
                    color: 'rgba(0,0,0,0.5)', 
                    size: 10,
                },
                font: {
                    color: 'white'
                }
            });
        }
    
        const seenEdges = new Set(); // Keep track of edges already added to prevent duplicates
        for (const vertex in this.networkGraph.graph) {
            for (const edge of this.networkGraph.graph[vertex]) {
                const linkKey = `${vertex}-${edge.vertex}`;
                const reverseKey = `${edge.vertex}-${vertex}`; // For undirected edge check
                if (!this.linkFailures[linkKey] && !seenEdges.has(reverseKey)) {
                    edges.add({ from: vertex, to: edge.vertex, label: `Cost: ${edge.cost}`, smooth: { type: 'continuous', roundness: 0.5 }});
                    seenEdges.add(linkKey); // Mark this edge as seen
                }
            }
        }
    
        const container = document.getElementById('network');
        const data = { nodes: nodes, edges: edges };
        const options = {
            physics: false, 
        };
    
        new vis.Network(container, data, options);
        this.log("Network visualization updated.");
        this.log("");
    }
}

new Network();
