var request=require('request');
var cheerio=require('cheerio');
var cassandra = require('cassandra-driver');
var client = new cassandra.Client({contactPoints: ['127.0.0.1:9042'], keyspace: 'demo'});
	var url1="https://www.indeed.co.in/jobs?q=java+developer&l=hyderbad%2C+Telangana";//we can give our required url here
	var companies=[];

	nextPage(url1);
	//checkconnection();
	function checkconnection(){
		client.execute("select * from demo.users", function (err, result) {
           if (!err){
               if ( result.rows.length > 0 ) {
                   var user = result.rows[0];
                   console.log("name = %s, age = %s", user.name, user.place);
               } else {
                   console.log("No results");
               }
           }
		})
	}
	function createCompany(company){

		var id=cassandra.types.uuid();

		client.execute("insert into demo.company(id,job_title,company_name)values(?,?,?)",[id,company.jobTitle,company.name], function (err, result) {
           if (!err){
               console.log("details added");
           }
		   else{
			   console.log("details not added");
		   }
		})


	}
	function findAllCompanies(body){
		var $=cheerio.load(body);
		console.log("Getting Comapnies");
		$('.result').each(function() { //result is the class used in each division containing the required data
			
			
			var company={};
			company.name= $(this).find('.company').text().trim();
			company.jobTitle= $(this).find('.jobtitle').text().trim();
			companies.push(company);// datas are entered to companies[]
			createCompany(company);
			console.log(company);// displays all company names and job titles 

		});
		
		
		var nextPageUrl="https://www.indeed.co.in"+$('.pagination a:last-child').attr('href');
		setTimeout(function(){
			nextPage(nextPageUrl);
		},2000)
		
	}
	function findByJobtitle(jobtitle){
		console.log("Searching companies wher job title "+jobtitle);
		
		var serachresult=companies.filter(function(company){ //companies with required job titles will be filtered and stored in search results
			return company.jobTitle.indexOf(jobtitle)>-1;
		});
	
		serachresult.forEach(function(company) {
			console.log(company.name);	//searchresult is iterated and company names will be displayed 
		});
	}

		function nextPage(url)
		{
			request(url,function(err,resp,body)
			{
		
			findAllCompanies(body);//function for displaying all companies and job titles and the body of website is passed here
			
			
			setTimeout(function(){
			findByJobtitle("java")//function for displaying companies with required required job title, we can pass the job title here
			},2000)
			
			})
		}
		
		
 
	
