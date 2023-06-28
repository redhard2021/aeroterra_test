using System;
using System.Collections.Generic;
using System.Data;
using System.Data.OleDb;
using System.IO;
using Asa.DataStore;

namespace Asa.MapApi.Data
{
    public class DbContext
    {
        private readonly XlsDriver driver;
        private readonly OleDbConnection conn;

        public DbContext(string fileName)
        {
            driver = new XlsDriver();
            string path = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Data", fileName);
            conn = driver.Connect(path);
        }

        public List<Object> GetData(string sheetPage)
        {
            conn.Open();
            DataTable dt = driver.ListData(conn, sheetPage);

            List<object> data = new List<Object>();
            foreach (DataRow row in dt.Rows)
            {
                IDictionary<string, object> props = new Dictionary<string, object>();
                foreach (DataColumn col in dt.Columns)
                {
                    props.Add(col.ColumnName.Replace(" ", "").Replace("(", "").Replace(")", ""), row[col.Ordinal]);
                }
                
                data.Add(props);
            }
            conn.Close();
            return data;
        }
    }
}