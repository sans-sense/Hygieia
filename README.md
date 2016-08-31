UI and other tweaks for adding collectors quickly. Refer to Imaginea branch for travis-ci support which need tweaks to build/config.[js,html]

For details of Hygieia refer to [Hygieia github repo](https://github.com/capitalone/Hygieia/)


If you want to write your own collectors, here are some unofficial tips. Word of caution, hacked around in two days, so YMMV.

Quirks
======================
Components need to be run at least once for the db to be properly seeded, for example, to get builds working, jenkins-build-collector has to run, which adds collector type and then jobs as collector items, the ui lets us match these jobs against dashboards. This does mean that any quick demo is tough, one way of getting around it is manually inserting the collectors and tweaking the ui to show these, [example commit](https://github.com/sans-sense/Hygieia/commit/8299b7fc05be45df5091a621507eb7704449d90c). 

 
Data Model
======
1. dashboard has widgets and an application.   
1. application and widgets refer to component (as per data model application can have multiple components, but UI only allows appname and componentName to be the same, refer to createDashboard.js), 
1. component has collectorItems.  
1. Data collected by collector must reference the collectorItem associated with the component.


Example
=======
1. dashboard data 
```
{ "_id" : ObjectId("57c410760396a47f674fb4ce"), 
  "_class" : "com.capitalone.dashboard.model.Dashboard", ...
  "widgets" : [ ], 
  "owner" : "apurba", 
  "type" : "Team", 
  "application" : { 
                "name" : "Ubuntu Mirror", 
                "components" : [ DBRef("components", ObjectId("57c410760396a47f674fb4cd")) ] } }
```
2. Component data referenced by this dashboard
```
{ "_id" : ObjectId("57c410760396a47f674fb4cd"), 
  "_class" : "com.capitalone.dashboard.model.Component", 
  "name" : "Ubuntu Mirror", 
  "collectorItems" : {  } 
  }
```
Alternate variation would be
```
{ ..., 
  "collectorItems" : { "SCM": [{..}], "Build":[{..}]..}, 
  for a list of values allowed in collectorItems refer CollectorType.java
```

Hacks
----
Add collector directly to db, some of them work only with collector items  
```
db.collectors.insert({ "_class" : "com.capitalone.dashboard.model.HudsonCollector", "buildServers" : [ "127.0.0.1" ], "niceNames" : [ ], "name" : "Hudson", "collectorType" : "Build", "enabled" : true, "online" : false, "lastExecuted" : NumberLong(0) })

db.collector_items.insert({"_class" : "com.capitalone.dashboard.model.CollectorItem", "enabled" : true, "pushed" : false, "collectorId" : <object id of the collector inserted in last step>, "lastUpdated" : NumberLong(0), "options" : { "instanceUrl" : "blah blah", "id":"remote"}, "description":"used-in-ui" })
```
0 to running for ubuntu
==================
```
## if mongo is not already installed
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
sudo apt-get update
sudo apt-get install -y mongodb-org
echo "mongodb-org hold" | sudo dpkg --set-selections

## Mongo Steps
## run on mongo terminal
use dashboard
db.createUser(
        {
          user: "db",
          pwd: "dbpass",
          roles: [
             {role: "readWrite", db: "dashboard"}
                  ]
          })
      
## Project Steps
git clone https://github.com/capitalone/Hygieia.git
cd Hygieia && mvn clean install package

## Execution Steps for collectors
cd UI && gulp serve &

cat > api/dashboard.properties <<EOF
dbname=dashboard
dbusername=db
dbpassword=dbpass
dbhost=127.0.0.1
dbport=27101
EOF

cd api && java -jar `ls target/api*.jar` --spring.config.location=dashboard.properties &

cd github-scm-collector && java -jar `ls target/*.jar --github.cron="0 0/30 * * * *" &

```
