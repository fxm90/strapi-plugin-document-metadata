import { Grid, Typography } from '@strapi/design-system';

/**
 * Displays a single metadata row consisting of a title and one or two lines of descriptive text.
 */
const MetadataRow = ({ title, line1, line2 }: { title: string; line1: string; line2?: string }) => {
  return (
    <Grid.Item direction="column" alignItems="stretch">
      <Typography variant="sigma">{title}</Typography>
      <Typography variant="pi" textColor="neutral600">
        {line1}
        <br />
        {line2}
      </Typography>
    </Grid.Item>
  );
};

export default MetadataRow;
