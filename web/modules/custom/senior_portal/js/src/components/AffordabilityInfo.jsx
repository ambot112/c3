export function AffordabilityInfo({ state, setState, blockConfigs }) {
  const partners = blockConfigs.partners;

  return (
    <div className="affordability-partners">
      {/* Heading section for the affordability information. */}
      <h3>Do You Work for One of Our Partners?</h3>

      {/* Image list section */}
      {partners.length > 0 && (
        <ul style={{ display: 'flex', gap: '16px', padding: 0, listStyle: 'none', flexWrap: 'wrap' }}>
          {partners.map((item, index) => (
            <li key={item.id || index}>
              <img
                src={item.image}
                alt={item.alt}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Main content container with text and list. */}
      <div>
        {/* Information paragraph introducing the options. */}
        <p className="text-center">
          You could be eligible to receive a scholarship for a <b>10-20% discount</b> off tuition if your employer is a UMass Global Partner Organization.
        </p>
        <p className="text-center">
          Be sure to ask your employer for information about education benefits available to employees.
        </p>
      </div>
    </div>
  );
}
