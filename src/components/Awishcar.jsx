import { useState } from "react";
import axios from 'axios';
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";

Chart.register(CategoryScale); 

const Awishcar=()=>{

    const [date,setDate]=useState({startdate:"",enddate:""})
    const [asteroidData,setAsteroidData]=useState({labels: [], datasets: []})
    const [nearestAsteroidData, setNearestAsteroidData] = useState({labels: [], datasets: []});
    const [fastestAsteroidData, setFastestAsteroidData] = useState({labels: [], datasets: []});
    const [error,setError]=useState(false)
    const [loading,setLoading]=useState(false)
    const [apierror,setApierror]=useState(false)
 
    const handleSubmit=async()=>{
        if(date.startdate==="" || date.enddate==="")
        {
            setError(true)
            return
        }
        try{
        setApierror(false)
        setError(false)
        setLoading(true)
        let result=await axios.get(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${date.startdate}&end_date=${date.enddate}&api_key=vWGnwIylVQChlhj6JwzpdQuXLpdMkvd7EDRxvS1q`)
        const data = Object.entries(result.data.near_earth_objects).map(([key, value]) => ({ date: key, count: value.length }));
        setAsteroidData({labels: data.map(item => item.date), datasets: [{label: 'Asteroid Count', data: data.map(item => item.count)}]});

        // Extract data for nearest asteroid
        const nearestAsteroid = result.data.near_earth_objects[Object.keys(result.data.near_earth_objects)[0]][0];
        const nearestAsteroidData = [{x: nearestAsteroid.close_approach_data[0].close_approach_date, y: nearestAsteroid.close_approach_data[0].miss_distance.astronomical}];
        setNearestAsteroidData({labels: ["Nearest Asteroid"], datasets: [{label: 'Miss Distance (in Astronomical Units)', data: nearestAsteroidData}]});

        // Extract data for fastest asteroid
        const fastestAsteroid = result.data.near_earth_objects[Object.keys(result.data.near_earth_objects)[0]].reduce((a, b) => a.close_approach_data[0].relative_velocity.kilometers_per_hour > b.close_approach_data[0].relative_velocity.kilometers_per_hour ? a : b);
        const fastestAsteroidData = [{x: fastestAsteroid.close_approach_data[0].close_approach_date, y: fastestAsteroid.close_approach_data[0].relative_velocity.kilometers_per_hour}];
        setFastestAsteroidData({labels: ["Fastest Asteroid"], datasets: [{label: 'Relative Velocity (km/h)', data: fastestAsteroidData}]});
        setLoading(false)
        setDate({startdate:"",enddate:""})
        }
        catch(err)
        {
            setLoading(false)
        setApierror(true)
                
        }
    }
    console.log(asteroidData)

    const handlechange= (e)=>{
          setDate({...date,startdate:e.target.value})
    }

    const handlechange2= (e)=>{
      setDate({...date,enddate:e.target.value})
}

    return (<> 
        <div className="container ">
           {!loading ? <form className=" d-flex flex-column justify-content-center" style={{height:"500px", width:"500px"}}>
  <div className="mb-3">
    <label for="start-date" class="form-label">Starting Date</label>
    <input type="date" class="form-control" onChange={handlechange} value={date.startdate} id="startdate" aria-describedby="emailHelp"/>
  </div>
  <div className="mb-3">
    <label for="end-date" class="form-label">Ending Date</label>
    <input type="date" class="form-control" onChange={handlechange2} id="enddate"/>
  </div>
  <button type="submit" class="btn btn-light" onClick={handleSubmit}>Submit</button></form>

           : <div className="container"><h1>Please wait for a while Data is Loading......</h1></div>} 

            <div style={{textAlign:"center"}}>
            {error && !date.startdate && <h1>Start date is missing</h1>}
            {error && !date.enddate && <h1>End date is missing</h1>}
            {apierror && <h1>The Feed date limit is only 7 Days</h1>}
            </div>
         
   { asteroidData.labels.length ?  <div className="chart-container" style={{width: "80vw", margin: "auto"}}>
      <h2 style={{ textAlign: "center" }}>Asteroid Chart</h2>
      <div className="graph-1 pt-3 pb-3">
      <Line        
       data={asteroidData}
      options={{
          plugins: {
            title: {
              display: true,
              text: "Asteroids by Date"
            },
            legend: {
              display: false
            }
          }
        }}
      />
      </div>
      <div className="graph-2 pt-3 pb-3">
      <Line 
        data={nearestAsteroidData}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Nearest Asteroid"
            },
            legend: {
              display: false
            }
          }
        }}
      />
      </div>
      <div className="graph-3 pt-3 pb-3">
      <Line
        data={fastestAsteroidData}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Fastest Asteroid"
            },
            legend: {
              display: false
            }
          }
        }}
      /> 
      </div>
    
    </div> : null}
    <div className="details" style={{textAlign:"center"}}>
      
      {fastestAsteroidData.datasets.length ?  <h1>Fastest Asteroid : {fastestAsteroidData.datasets[0].data[0].y} km/h</h1> : ""}
       {nearestAsteroidData.datasets.length ?<h1>Closest Asteroid : {nearestAsteroidData.datasets[0].data[0].y}</h1> : "" }
       </div>
        </div>

    </>)
}

export default Awishcar;
