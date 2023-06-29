using System.Collections.Generic;
using System.Web.Mvc;
using Asa.MapApi.Data;

namespace Asa.MapApi.Controllers
{
    public class ApiController : Controller
    {
        DbContext dbContext = new DbContext("ds.xls");
        
        // GET: Api
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Categories(string id, Dictionary<string, object> entity)
        {
            // sheetName: Categorias
            switch (Request.HttpMethod)
            {
                case "GET":
                    List<object> categories = new List<object>();
                    categories = dbContext.GetData("Categories");
                    
                    return Json(new { categories = categories.ToArray() }, JsonRequestBehavior.AllowGet);
                    
            }

            Response.StatusCode = 400;
            return Json(new { error = "Method not suported." }, JsonRequestBehavior.AllowGet);
        }


        public ActionResult ValidateForm(string id, Dictionary<string, object> entity)
        {
            if (Request.HttpMethod == "POST")
            {
                return Json(new { entity = entity, isvalid = false, errors = new string[] {"Message"} }, JsonRequestBehavior.AllowGet);
            }

            Response.StatusCode = 400;
            return Json(new { error = "Method not suported." }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult POIs(string id, Dictionary<string, object> entity)
        {
            
            switch (Request.HttpMethod)
            {
                case "GET":
                    List<object> _POIs = new List<object>();
                    _POIs = dbContext.GetData("POIs");
                        
                    return Json(new { pois = _POIs.ToArray() }, JsonRequestBehavior.AllowGet);
                case "POST":
                    //return Json(new { }, JsonRequestBehavior.AllowGet);
                case "PUT":
                    //UpdatePOI (id, entity)
                    break;
                case "DELETE":
                    //DeletePOI (id)
                    break;
            }

            Response.StatusCode = 400;
            return Json(new { error = "Method not suported." }, JsonRequestBehavior.AllowGet);
        }
    }
}
