const AIRTABLE_BASE_ID = 'appkHTO5Avmr2D6YH';
const AIRTABLE_TABLE_ID = 'tblr7drFoquaVLfun';
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;

// Headers para requisições Airtable
const headers = {
  'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
};

// GET - Buscar todos os registros
async function getRecords() {
  try {
    const response = await fetch(AIRTABLE_API_URL, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`Airtable error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('GET error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// POST - Criar novo registro
async function createRecord(body) {
  try {
    const { fields } = body;
    
    const response = await fetch(AIRTABLE_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        records: [{ fields }],
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Airtable error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('POST error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// PATCH - Atualizar registro
async function updateRecord(recordId, body) {
  try {
    const { fields } = body;
    const url = `${AIRTABLE_API_URL}/${recordId}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ fields }),
    });
    
    if (!response.ok) {
      throw new Error(`Airtable error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('PATCH error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// DELETE - Deletar registro
async function deleteRecord(recordId) {
  try {
    const url = `${AIRTABLE_API_URL}/${recordId}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`Airtable error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('DELETE error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// Handler principal
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    let result;

    if (req.method === 'GET') {
      result = await getRecords();
    } else if (req.method === 'POST') {
      result = await createRecord(req.body);
    } else if (req.method === 'PATCH') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Record ID is required for PATCH' });
      }
      result = await updateRecord(id, req.body);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Record ID is required for DELETE' });
      }
      result = await deleteRecord(id);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const statusCode = result.statusCode;
    const body = JSON.parse(result.body);

    res.status(statusCode).json(body);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
