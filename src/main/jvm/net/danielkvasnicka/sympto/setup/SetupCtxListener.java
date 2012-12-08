package net.danielkvasnicka.sympto.setup;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;
import java.util.logging.Logger;

/**
 * Created with IntelliJ IDEA.
 * User: daniel
 * Date: 08.12.12
 * Time: 17:39
 */
@WebListener
public class SetupCtxListener implements ServletContextListener {

    public static final Logger LOGGER = Logger.getLogger(SetupCtxListener.class.getSimpleName());
    public static final String BASEX_DBPATH_PRODUCTION = "basex";

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        String openshiftDataDir = System.getenv("OPENSHIFT_DATA_DIR");
        if (openshiftDataDir != null) {
            String dbpathAbsolute = openshiftDataDir + BASEX_DBPATH_PRODUCTION;
            sce.getServletContext().setInitParameter("org.basex.dbpath", dbpathAbsolute);
            LOGGER.info("Production mode - BaseX dbpath: " + dbpathAbsolute);
        } else {
            LOGGER.info("Development mode - BaseX dbpath will remain unchnged.");
            sce.getServletContext().setInitParameter("org.basex.dbpath", "/Users/daniel/BaseXData");
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
    }
}
