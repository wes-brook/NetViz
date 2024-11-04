/* ==============================================================================================================================
 * File: graph.js
 * Date: 10/21/2024
 * Author: Wesly Barayuga
 * Purpose: Graph implementation from scratch
 *
 * Features:    >> addVertex(vertex)            Add a new vertex to a graph      
 *              >> addEdge(src, des, cost)      Add a new link between 2 vertices in a graph
 *              >> removeVertex(vertex)         Remove a vertice in a graph
 *              >> removeEdge(src, des)         Remove a link between 2 vertices in a graph
 *              >> getNeighbors(vertex)         Get an array of neigbors to an existing vertice in a graph
 *              >> show()                       Print the graph
 *
 * User Notice:
 *  - A graph is a data structure resemblemnt of a network where we have a set of vertices and a set of edges (and weights if applicable)
 *  - A graph is an abstract data type
 *  - A graph can be undirected or directed
 *  - Time Complexity: O(V + E), where V is the number of vertices and E is the number of edges
 * ============================================================================================================================== */


class Graph {
    // Initialize a new Graph object 
    constructor(label) {
        this.graph = {};
    }

    // Add a new vertice in the graph
    addVertex(vertex) {
        if (!this.graph.hasOwnProperty(vertex)) {
            this.graph[vertex] = [];
        }
    }

    // Add a new link between 2 vertices in the graph
    addEdge(src, des, cost) {
        if (this.graph.hasOwnProperty(src) && this.graph.hasOwnProperty(des)) {
            this.graph[src].push({vertex: des, cost: cost});
            this.graph[des].push({vertex: src, cost: cost}); // Uncomment for undirected graph
        }
    }

    // Remove a vertice in the graph
    removeVertex(vertex) {
        if (this.graph.hasOwnProperty(vertex)) {
            // First remove the vertex from the adjacency lists of other vertices
            for (const neighbor in this.graph) {
                this.graph[neighbor] = this.graph[neighbor].filter(edge => edge.vertex !== vertex); // NOTE: Wes, filter is a JS function that creates a shallow copy of an object and filters content by the conditions (function) you pass it
            }
            // Delete the vertex from this graph
            delete this.graph[vertex];
        }
    }

    // Get the neighbors of a select vertice
    getNeighbors(vertex) {
        if (this.graph.hasOwnProperty(vertex)) {
            return this.graph[vertex];
        }
        return [];
    }

    // Remove a link between 2 vertices in the graph
    removeEdge(src, des) {
        if (this.graph.hasOwnProperty(src) && this.graph.hasOwnProperty(des)) {
            this.graph[src] = this.graph[src].filter(edge => edge.vertex !== des);
            this.graph[des] = this.graph[des].filter(edge => edge.vertex !== src);
        }
    }

    // DFS dives into one branch of the graph as far as possible before backtracking
    DFS(start) {
        const visited = {}; // Init empty stack
        const stack = []; // Init empty object

        stack.push(start);

        console.log("Performing DFS: ");

        while (stack.length > 0) {
            // Pop the last vertex in the stack
            const vertex = stack.pop();

            // If the vertex has not been visited, mark it visited and log it
            if (!visited[vertex]) {
                visited[vertex] = true;
                console.log(vertex + " ");

                // Push all unvisited neighbors onto the stack
                for (let neighbor of this.graph[vertex]) {
                    if (!visited[neighbor.vertex]) {
                        stack.push(neighbor.vertex);
                    }
                }
            }
        }
    }

    // BFS visits all neighbors of a vertex before moving to the next level
    BFS(start) {
        const visited = {}; // Init empty stack
        const queue = []; // Init empty object

        // Start with the initial vertex
        visited[start] = true;
        queue.push(start);

        console.log("Performing BFS: ");

        while (queue.length > 0) {
            // Dequeue a vertex from the queue
            const vertex = queue.shift();
            console.log(vertex + " ");

            // Loop over neighbors of current vertex
            for (let neighbor of this.graph[vertex]) {
                if (!visited[neighbor.vertex]) {
                    visited[neighbor.vertex] = true; // Mark the neighbor as visited
                    queue.push(neighbor.vertex);
                }
            }
        }
    }

    // Show the graph
    show() {
        console.log("Printing graph:");
        for (const vertex in this.graph) {
            const edges = this.graph[vertex].map(edge => `${edge.vertex} (cost: ${edge.cost})`);
            console.log(vertex, " -> ", edges.join(", "));
        }
    }
}

function test() {
    var g = new Graph();
    const src = "a";

    g.addVertex("a");
    g.addVertex("b");
    g.addVertex("c");

    g.addEdge("a", "b", 3);
    g.addEdge("a", "c", 2);
    g.addEdge("b", "c", 4);

    //g.show();
    console.log("Source: ", src);
    g.DFS(src);
    g.BFS(src);
}

//test();

export default Graph;